import { Sparkles } from "lucide-react";

export function AppLogo({ size = 32 }: { size?: number }) {
    return (
        <div
            style={{ width: size, height: size }}
            className="rounded-xl flex items-center justify-center shrink-0 bg-primary/10 text-primary"
        >
            <Sparkles size={size * 0.6} />
        </div>
    );
}
