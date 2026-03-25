import { Toaster as Sonner } from "sonner"
import { CheckCircle2, XCircle, Info, AlertTriangle } from "lucide-react"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  return (
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
            "w-full flex items-start gap-3 rounded-xl border border-white/10 bg-zinc-900/80 backdrop-blur-xl px-4 py-3 shadow-2xl shadow-black/40 text-sm text-zinc-100",
          title: "font-medium text-zinc-50",
          description: "text-zinc-400 text-xs mt-0.5",
          actionButton:
            "bg-white text-zinc-900 font-medium text-xs rounded-lg px-3 py-1.5 hover:bg-zinc-200 transition-colors",
          cancelButton:
            "bg-zinc-800 text-zinc-300 font-medium text-xs rounded-lg px-3 py-1.5 hover:bg-zinc-700 transition-colors",
          closeButton:
            "!bg-transparent !border-0 !text-zinc-500 hover:!text-zinc-300 !shadow-none",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
