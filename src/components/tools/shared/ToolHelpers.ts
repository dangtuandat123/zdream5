export function getDynamicGridClass(count: number, aspectRatio?: string) {
    if (count === 1) {
        // Nhóm tỉ lệ dọc (Portrait)
        if (["9:16", "4:5", "2:3", "3:4"].includes(aspectRatio || "")) {
            return "grid grid-cols-1 w-full max-w-sm mx-auto gap-4" // ~384px
        }
        // Nhóm tỉ lệ vuông (Square)
        if (aspectRatio === "1:1") {
            return "grid grid-cols-1 w-full max-w-md mx-auto gap-4" // ~448px
        }
        // Mặc định dọc ngang (Landscape / Base)
        return "grid grid-cols-1 w-full max-w-2xl mx-auto gap-4" // ~672px
    }
    if (count === 2) return "grid grid-cols-1 sm:grid-cols-2 max-w-4xl mx-auto gap-4"
    if (count === 3) return "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 max-w-6xl mx-auto gap-4"
    return "grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-4 max-w-7xl mx-auto gap-4"
}
