import { Toaster as Sonner } from "sonner"
import { CheckCircle2, XCircle, Info, AlertTriangle } from "lucide-react"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <>
      {/* Override vị trí nút X của Sonner close button */}
      <style>{`
        [data-sonner-toast] [data-close-button] {
          position: absolute !important;
          top: 6px !important;
          right: 6px !important;
          left: auto !important;
          bottom: auto !important;
          transform: none !important;
          width: 20px !important;
          height: 20px !important;
          border-radius: 9999px !important;
          border: none !important;
          background: transparent !important;
          color: rgba(161, 161, 170, 0.6) !important;
          box-shadow: none !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          padding: 0 !important;
          opacity: 0;
          transition: opacity 0.15s, color 0.15s !important;
          cursor: pointer !important;
        }
        [data-sonner-toast]:hover [data-close-button] {
          opacity: 1 !important;
        }
        [data-sonner-toast] [data-close-button]:hover {
          color: rgba(244, 244, 245, 0.9) !important;
          background: rgba(255, 255, 255, 0.1) !important;
        }
        [data-sonner-toast] [data-close-button] svg {
          width: 12px !important;
          height: 12px !important;
        }
      `}</style>
      <Sonner
        theme="dark"
        position="top-right"
        richColors={false}
        closeButton
        gap={8}
        icons={{
          success: <CheckCircle2 className="size-[18px] text-emerald-400" />,
          error: <XCircle className="size-[18px] text-red-400" />,
          info: <Info className="size-[18px] text-blue-400" />,
          warning: <AlertTriangle className="size-[18px] text-amber-400" />,
        }}
        toastOptions={{
          unstyled: true,
          classNames: {
            toast:
              "w-full flex items-start gap-3 rounded-xl border border-white/10 bg-zinc-900/80 backdrop-blur-xl pl-4 pr-8 py-3 shadow-2xl shadow-black/40 text-sm text-zinc-100",
            title: "font-medium text-zinc-50",
            description: "text-zinc-400 text-xs mt-0.5",
            actionButton:
              "bg-white text-zinc-900 font-medium text-xs rounded-lg px-3 py-1.5 hover:bg-zinc-200 transition-colors",
            cancelButton:
              "bg-zinc-800 text-zinc-300 font-medium text-xs rounded-lg px-3 py-1.5 hover:bg-zinc-700 transition-colors",
          },
        }}
        {...props}
      />
    </>
  )
}

export { Toaster }
