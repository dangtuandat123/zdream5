/**
 * ImageLightbox — Shared fullscreen image viewer component
 * Dùng chung cho GeneratePage, LibraryPage, TemplateDetailPage.
 * Hỗ trợ: zoom/pan (mouse + touch + pinch), swipe navigation, keyboard, info panel.
 */
import { useState, useRef, useCallback, useEffect, type ReactNode } from "react"
import { createPortal } from "react-dom"
import { Button } from "@/components/ui/button"
import {
    X, Info, ZoomIn, ZoomOut, Maximize2,
    ChevronLeft, ChevronRight, Loader2,
} from "lucide-react"

export interface ImageLightboxProps {
    /** Mở/đóng lightbox */
    open: boolean
    onClose: () => void
    /** Danh sách URL ảnh */
    images: string[]
    /** Index hiện tại */
    currentIndex: number
    /** Callback khi chuyển ảnh */
    onIndexChange: (index: number) => void
    /** Max zoom level (default 5) */
    maxZoom?: number
    /** Badge góc trên trái (e.g. "AI", type badge) */
    badge?: ReactNode
    /** Custom action buttons trong bottom bar (sau zoom controls) */
    actions?: ReactNode
    /** Nội dung info panel (không bao gồm header — header đã có sẵn) */
    infoPanel?: ReactNode
    /** Ẩn nút info toggle nếu không có infoPanel (default: auto) */
    showInfoButton?: boolean
}

export function ImageLightbox({
    open,
    onClose,
    images,
    currentIndex,
    onIndexChange,
    maxZoom = 5,
    badge,
    actions,
    infoPanel,
    showInfoButton,
}: ImageLightboxProps) {
    const [showInfo, setShowInfo] = useState(false)
    const [isImageLoading, setIsImageLoading] = useState(true)
    const [zoom, setZoom] = useState(1)
    const [position, setPosition] = useState({ x: 0, y: 0 })

    const safeIndex = Math.min(Math.max(currentIndex, 0), images.length - 1)
    const currentImgUrl = images[safeIndex]

    // Có nút info hay không
    const hasInfoButton = showInfoButton ?? !!infoPanel

    // ── Zoom/pan refs (zero React re-render khi gesture) ──
    const transformRef = useRef({ x: 0, y: 0, zoom: 1 })
    const gestureActive = useRef(false)
    const mouseDragStart = useRef({ x: 0, y: 0 })
    const isMouseDragging = useRef(false)
    const dimsCache = useRef({ cw: 0, ch: 0, dw: 0, dh: 0 })
    const imageContainerRef = useRef<HTMLDivElement>(null)
    const imgRef = useRef<HTMLImageElement>(null)
    const dragStart = useRef({ x: 0, y: 0 })
    const lastTouchDistance = useRef<number | null>(null)
    const lastTouchCenter = useRef<{ x: number; y: number } | null>(null)
    const isTouchPanning = useRef(false)
    const touchStartPos = useRef<{ x: number; y: number } | null>(null)
    const lastTapTime = useRef(0)

    // ── Helper functions ──
    const updateDimsCache = () => {
        const container = imageContainerRef.current
        const img = imgRef.current
        if (!container || !img) return
        const cw = container.clientWidth, ch = container.clientHeight
        const nw = img.naturalWidth || cw, nh = img.naturalHeight || ch
        const r = nw / nh, cr = cw / ch
        dimsCache.current = {
            cw, ch,
            dw: r > cr ? cw : ch * r,
            dh: r > cr ? cw / r : ch,
        }
    }

    const clampPos = (x: number, y: number, z: number) => {
        const { cw, ch, dw, dh } = dimsCache.current
        if (cw === 0) return { x, y }
        const mx = Math.max(0, (dw * z - cw) / 2)
        const my = Math.max(0, (dh * z - ch) / 2)
        return { x: Math.max(-mx, Math.min(mx, x)), y: Math.max(-my, Math.min(my, y)) }
    }

    const applyTransformDOM = () => {
        const img = imgRef.current
        if (!img) return
        const { x, y, zoom: z } = transformRef.current
        img.style.transitionDuration = '0ms'
        img.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${z})`
    }

    const syncToState = useCallback(() => {
        const { x, y, zoom: z } = transformRef.current
        setZoom(z)
        setPosition({ x, y })
        if (imgRef.current) imgRef.current.style.transitionDuration = '200ms'
    }, [])

    const resetZoom = useCallback(() => {
        transformRef.current = { x: 0, y: 0, zoom: 1 }
        applyTransformDOM()
        syncToState()
    }, [syncToState])

    const applyZoom = useCallback((newZ: number) => {
        const z = Math.min(Math.max(newZ, 1), maxZoom)
        const pos = z === 1 ? { x: 0, y: 0 } : clampPos(transformRef.current.x, transformRef.current.y, z)
        transformRef.current = { ...pos, zoom: z }
        applyTransformDOM()
        syncToState()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [syncToState, maxZoom])

    const handleZoomIn = useCallback(() => applyZoom(transformRef.current.zoom + 0.5), [applyZoom])
    const handleZoomOut = useCallback(() => applyZoom(transformRef.current.zoom - 0.5), [applyZoom])

    // ── Reset zoom khi thay đổi ảnh ──
    useEffect(() => {
        setIsImageLoading(true)
        transformRef.current = { x: 0, y: 0, zoom: 1 }
        applyTransformDOM()
        syncToState()
        const img = imgRef.current
        if (img) {
            const onLoad = () => updateDimsCache()
            img.addEventListener('load', onLoad)
            requestAnimationFrame(updateDimsCache)
            return () => img.removeEventListener('load', onLoad)
        }
    }, [safeIndex, syncToState])

    // ── Navigation ──
    const handleClose = useCallback(() => {
        onClose()
        setShowInfo(false)
        resetZoom()
    }, [onClose, resetZoom])

    const handlePrev = useCallback(() => {
        if (safeIndex > 0) onIndexChange(safeIndex - 1)
    }, [safeIndex, onIndexChange])

    const handleNext = useCallback(() => {
        if (safeIndex < images.length - 1) onIndexChange(safeIndex + 1)
    }, [safeIndex, images.length, onIndexChange])

    // Refs cho touch swipe (tránh stale closures)
    const handleNextRef = useRef(handleNext)
    const handlePrevRef = useRef(handlePrev)
    useEffect(() => { handleNextRef.current = handleNext }, [handleNext])
    useEffect(() => { handlePrevRef.current = handlePrev }, [handlePrev])

    // ── Mouse drag pan (desktop) ──
    const handleMouseDownPan = (e: React.MouseEvent) => {
        if (transformRef.current.zoom <= 1) return
        e.preventDefault()
        isMouseDragging.current = true
        mouseDragStart.current = { x: e.clientX - transformRef.current.x, y: e.clientY - transformRef.current.y }
    }
    const handleMouseMovePan = (e: React.MouseEvent) => {
        if (!isMouseDragging.current) return
        e.preventDefault()
        const z = transformRef.current.zoom
        const p = clampPos(e.clientX - mouseDragStart.current.x, e.clientY - mouseDragStart.current.y, z)
        transformRef.current = { ...p, zoom: z }
        applyTransformDOM()
    }
    const handleMouseUpPan = () => {
        if (!isMouseDragging.current) return
        isMouseDragging.current = false
        syncToState()
    }
    const handleWheelZoom = (e: React.WheelEvent) => {
        if (e.deltaY < 0) handleZoomIn()
        else handleZoomOut()
    }

    // ── Native touch listeners — zero React re-renders during gesture ──
    useEffect(() => {
        const el = imageContainerRef.current
        if (!el || !open) return
        updateDimsCache()

        const onTouchStart = (e: TouchEvent) => {
            if (e.touches.length === 2) {
                e.preventDefault()
                gestureActive.current = true
                const dx = e.touches[0].clientX - e.touches[1].clientX
                const dy = e.touches[0].clientY - e.touches[1].clientY
                lastTouchDistance.current = Math.hypot(dx, dy)
                lastTouchCenter.current = {
                    x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
                    y: (e.touches[0].clientY + e.touches[1].clientY) / 2
                }
                isTouchPanning.current = false
                touchStartPos.current = null
            } else if (e.touches.length === 1) {
                const t = e.touches[0]
                touchStartPos.current = { x: t.clientX, y: t.clientY }
                if (transformRef.current.zoom > 1) {
                    gestureActive.current = true
                    isTouchPanning.current = true
                    dragStart.current = { x: t.clientX - transformRef.current.x, y: t.clientY - transformRef.current.y }
                }
                // Double-tap
                const now = Date.now()
                if (now - lastTapTime.current < 300) {
                    e.preventDefault()
                    if (transformRef.current.zoom > 1) resetZoom()
                    else applyZoom(2.5)
                    lastTapTime.current = 0
                    touchStartPos.current = null
                } else {
                    lastTapTime.current = now
                }
            }
        }

        const onTouchMove = (e: TouchEvent) => {
            if (e.touches.length === 2 && lastTouchDistance.current !== null) {
                e.preventDefault()
                const dx = e.touches[0].clientX - e.touches[1].clientX
                const dy = e.touches[0].clientY - e.touches[1].clientY
                const distance = Math.hypot(dx, dy)
                const scale = distance / lastTouchDistance.current
                const newZ = Math.min(Math.max(transformRef.current.zoom * scale, 1), maxZoom)
                if (newZ === 1) {
                    transformRef.current = { x: 0, y: 0, zoom: 1 }
                } else if (lastTouchCenter.current) {
                    const cx = (e.touches[0].clientX + e.touches[1].clientX) / 2
                    const cy = (e.touches[0].clientY + e.touches[1].clientY) / 2
                    const np = clampPos(
                        transformRef.current.x + (cx - lastTouchCenter.current.x),
                        transformRef.current.y + (cy - lastTouchCenter.current.y),
                        newZ
                    )
                    transformRef.current = { ...np, zoom: newZ }
                    lastTouchCenter.current = { x: cx, y: cy }
                } else {
                    transformRef.current.zoom = newZ
                }
                applyTransformDOM()
                lastTouchDistance.current = distance
            } else if (e.touches.length === 1 && isTouchPanning.current && transformRef.current.zoom > 1) {
                e.preventDefault()
                const t = e.touches[0]
                const np = clampPos(t.clientX - dragStart.current.x, t.clientY - dragStart.current.y, transformRef.current.zoom)
                transformRef.current = { ...np, zoom: transformRef.current.zoom }
                applyTransformDOM()
            }
        }

        const onTouchEnd = (e: TouchEvent) => {
            // Swipe navigation (not zoomed)
            if (touchStartPos.current && transformRef.current.zoom <= 1 && e.changedTouches.length === 1) {
                const dx = e.changedTouches[0].clientX - touchStartPos.current.x
                const dy = e.changedTouches[0].clientY - touchStartPos.current.y
                if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) {
                    if (dx > 0) handlePrevRef.current()
                    else handleNextRef.current()
                }
            }
            lastTouchDistance.current = null
            lastTouchCenter.current = null
            isTouchPanning.current = false
            touchStartPos.current = null
            if (gestureActive.current) {
                gestureActive.current = false
                syncToState()
            }
        }

        el.addEventListener('touchstart', onTouchStart, { passive: false })
        el.addEventListener('touchmove', onTouchMove, { passive: false })
        el.addEventListener('touchend', onTouchEnd)
        return () => {
            el.removeEventListener('touchstart', onTouchStart)
            el.removeEventListener('touchmove', onTouchMove)
            el.removeEventListener('touchend', onTouchEnd)
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, safeIndex, syncToState, resetZoom, applyZoom, maxZoom])

    // ── Keyboard: ← → ESC ──
    useEffect(() => {
        if (!open) return
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') { handleClose(); return }
            if (e.key === 'ArrowLeft') handlePrev()
            if (e.key === 'ArrowRight') handleNext()
        }
        window.addEventListener('keydown', handler)
        return () => window.removeEventListener('keydown', handler)
    }, [open, handleClose, handlePrev, handleNext])

    // ── Lock body scroll ──
    useEffect(() => {
        if (open) {
            document.body.style.overflow = 'hidden'
            return () => { document.body.style.overflow = '' }
        }
    }, [open])

    if (!open || images.length === 0) return null

    return createPortal(
        <div className="fixed inset-0 z-50 bg-black text-slate-200" style={{ touchAction: 'none' }}>
            <div className="relative w-full h-[100dvh] flex overflow-hidden">
                {/* === Phần chính: ảnh + controls === */}
                <div className={`relative flex-1 flex items-center justify-center transition-all duration-300 ${showInfo ? 'lg:mr-[360px]' : ''}`}>
                    {/* Top bar — counter, info toggle, close */}
                    <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between p-3 sm:p-4 pointer-events-none">
                        {/* Trái: badge + counter */}
                        <div className="flex items-center gap-2.5 pointer-events-auto">
                            {badge}
                            {images.length > 1 && (
                                <span className="text-xs text-white/70 font-medium tabular-nums bg-white/10 rounded-full px-2.5 py-0.5">
                                    {safeIndex + 1} / {images.length}
                                </span>
                            )}
                        </div>

                        {/* Phải: info toggle + close */}
                        <div className="flex items-center gap-1.5 pointer-events-auto">
                            {hasInfoButton && (
                                <Button
                                    variant="ghost"
                                    title="Chi tiết ảnh"
                                    className={`rounded-full h-9 px-3.5 shadow-lg transition-colors gap-1.5 text-xs font-medium ${showInfo ? 'border border-white bg-white text-black hover:bg-neutral-200 hover:text-black' : 'bg-black/60 text-white hover:bg-black/80'}`}
                                    onClick={() => setShowInfo(!showInfo)}
                                >
                                    <Info className="size-3.5" />
                                    <span>Chi tiết ảnh</span>
                                </Button>
                            )}
                            <Button
                                variant="outline"
                                size="icon"
                                className="rounded-full bg-white text-black hover:bg-neutral-200 hover:text-black border-none shadow-lg h-9 w-9"
                                onClick={handleClose}
                            >
                                <X className="size-5" />
                            </Button>
                        </div>
                    </div>

                    {/* Action Bar (Góc dưới) — safe-area cho iPhone */}
                    <div className="absolute bottom-[max(1rem,env(safe-area-inset-bottom))] sm:bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1.5 sm:gap-2 p-1 sm:p-1.5 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl pointer-events-auto">
                        {/* Group: Zoom Controls */}
                        <div className="hidden sm:flex items-center gap-0.5 sm:gap-1 border-r border-white/10 pr-1.5 sm:pr-2 mr-0.5 sm:mr-1">
                            <Button variant="ghost" size="icon" title="Thu nhỏ" className="text-white hover:bg-white/20 h-8 w-8 sm:h-9 sm:w-9 py-0 rounded-xl" onClick={handleZoomOut} disabled={zoom <= 1}>
                                <ZoomOut className="size-4" />
                            </Button>
                            <span className="text-[11px] sm:text-xs font-medium w-9 sm:w-10 text-center text-white/80 select-none tabular-nums">
                                {Math.round(zoom * 100)}%
                            </span>
                            <Button variant="ghost" size="icon" title="Phóng to" className="text-white hover:bg-white/20 h-8 w-8 sm:h-9 sm:w-9 py-0 rounded-xl" onClick={handleZoomIn} disabled={zoom >= maxZoom}>
                                <ZoomIn className="size-4" />
                            </Button>
                            {zoom > 1 && (
                                <Button variant="ghost" size="icon" title="Đặt lại" className="text-white hover:bg-white/20 h-8 w-8 sm:h-9 sm:w-9 py-0 rounded-xl" onClick={resetZoom}>
                                    <Maximize2 className="size-4" />
                                </Button>
                            )}
                        </div>

                        {/* Custom actions từ parent */}
                        {actions}
                    </div>

                    {/* Nút Previous */}
                    <div className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-40 pointer-events-none">
                        <Button
                            variant="outline"
                            size="icon"
                            className={`size-9 sm:size-12 rounded-full bg-white/80 sm:bg-white text-black hover:bg-neutral-200 hover:text-black border-none shadow-lg transition-opacity pointer-events-auto ${safeIndex === 0 ? 'opacity-0 !pointer-events-none' : 'opacity-100'}`}
                            onClick={(e) => { e.stopPropagation(); handlePrev() }}
                        >
                            <ChevronLeft className="size-5 sm:size-8" />
                        </Button>
                    </div>

                    {/* Nút Next */}
                    <div className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-40 pointer-events-none">
                        <Button
                            variant="outline"
                            size="icon"
                            className={`size-9 sm:size-12 rounded-full bg-white/80 sm:bg-white text-black hover:bg-neutral-200 hover:text-black border-none shadow-lg transition-opacity pointer-events-auto ${safeIndex === images.length - 1 ? 'opacity-0 !pointer-events-none' : 'opacity-100'}`}
                            onClick={(e) => { e.stopPropagation(); handleNext() }}
                        >
                            <ChevronRight className="size-5 sm:size-8" />
                        </Button>
                    </div>

                    {/* Container Hình Ảnh (Pan & Zoom Wrapper) */}
                    <div
                        ref={imageContainerRef}
                        className={`w-full h-full p-0 flex items-center justify-center relative overflow-hidden select-none ${zoom > 1 ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'}`}
                        style={{ touchAction: 'none' }}
                        onWheel={handleWheelZoom}
                        onMouseDown={handleMouseDownPan}
                        onMouseMove={handleMouseMovePan}
                        onMouseUp={handleMouseUpPan}
                        onMouseLeave={handleMouseUpPan}
                        onDoubleClick={zoom > 1 ? resetZoom : handleZoomIn}
                    >
                        {/* Loading spinner khi ảnh chưa tải xong */}
                        {isImageLoading && (
                            <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                                <Loader2 className="size-8 animate-spin text-white/30" />
                            </div>
                        )}
                        <img
                            ref={imgRef}
                            src={currentImgUrl}
                            alt="Xem ảnh"
                            className={`max-w-[90vw] max-h-[80dvh] object-contain filter drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] will-change-transform ${isImageLoading ? 'invisible' : 'visible'}`}
                            style={{
                                transform: `translate3d(${position.x}px, ${position.y}px, 0) scale(${zoom})`,
                                transitionProperty: 'transform',
                                transitionTimingFunction: 'ease-out',
                                transitionDuration: '0ms',
                            }}
                            onLoad={() => setIsImageLoading(false)}
                            draggable={false}
                        />
                    </div>
                </div>

                {/* === Info Panel — sidebar trên desktop, bottom sheet trên mobile === */}
                {showInfo && infoPanel && (
                    <div
                        className="fixed lg:absolute inset-x-0 bottom-0 lg:inset-y-0 lg:left-auto lg:right-0 lg:w-[360px] z-[60] bg-neutral-900/95 backdrop-blur-xl border-t lg:border-t-0 lg:border-l border-white/10 overflow-y-auto animate-in slide-in-from-bottom lg:slide-in-from-right duration-300 max-h-[70vh] lg:max-h-none rounded-t-2xl lg:rounded-t-none"
                        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
                    >
                        {/* Mobile grab handle */}
                        <div className="lg:hidden flex justify-center pt-2">
                            <div className="w-10 h-1 rounded-full bg-white/20" />
                        </div>
                        {/* Header panel */}
                        <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-3 lg:py-4 bg-neutral-900/80 backdrop-blur-md border-b border-white/5">
                            <h3 className="text-sm font-semibold text-white">Chi tiết ảnh</h3>
                            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full text-white/60 hover:text-white hover:bg-white/10" onClick={() => setShowInfo(false)}>
                                <X className="size-4" />
                            </Button>
                        </div>

                        {/* Nội dung info từ parent */}
                        {infoPanel}
                    </div>
                )}
            </div>
        </div>,
        document.body
    )
}
