import { RectangleHorizontal, RectangleVertical, Square } from "lucide-react"

export const ASPECT_RATIOS = [
    { value: "1:1", label: "1:1", ratio: 1, icon: Square },
    { value: "2:3", label: "2:3", ratio: 2/3, icon: RectangleVertical },
    { value: "3:2", label: "3:2", ratio: 3/2, icon: RectangleHorizontal },
    { value: "3:4", label: "3:4", ratio: 3/4, icon: RectangleVertical },
    { value: "4:3", label: "4:3", ratio: 4/3, icon: RectangleHorizontal },
    { value: "4:5", label: "4:5", ratio: 4/5, icon: RectangleVertical },
    { value: "5:4", label: "5:4", ratio: 5/4, icon: RectangleHorizontal },
    { value: "9:16", label: "9:16", ratio: 9/16, icon: RectangleVertical },
    { value: "16:9", label: "16:9", ratio: 16/9, icon: RectangleHorizontal },
    { value: "21:9", label: "21:9", ratio: 21/9, icon: RectangleHorizontal },
    // Extended aspect ratios (for Gemini 3.1)
    { value: "1:4", label: "1:4", ratio: 1/4, icon: RectangleVertical },
    { value: "4:1", label: "4:1", ratio: 4/1, icon: RectangleHorizontal },
    { value: "1:8", label: "1:8", ratio: 1/8, icon: RectangleVertical },
    { value: "8:1", label: "8:1", ratio: 8/1, icon: RectangleHorizontal },
]

export const IMAGE_COUNTS = [1, 2, 3, 4]

export const RESOLUTIONS = [
    { value: "0.5K", label: "0.5K", desc: "Nhanh" },
    { value: "1K", label: "1K", desc: "Chuẩn" },
    { value: "2K", label: "2K", desc: "Nét hơn" },
    { value: "4K", label: "4K", desc: "Siêu nét" },
]
