import { useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"

export function GoogleCallback() {
    const [params] = useSearchParams()
    const navigate = useNavigate()
    const { loginWithToken } = useAuth()

    useEffect(() => {
        const token = params.get("token")
        const error = params.get("error")

        if (error || !token) {
            navigate("/login", { replace: true })
            return
        }

        loginWithToken(token).then(() => {
            navigate("/app/home", { replace: true })
        }).catch(() => {
            navigate("/login", { replace: true })
        })
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="flex flex-col items-center gap-4">
                <div className="size-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-muted-foreground">Đang đăng nhập với Google...</p>
            </div>
        </div>
    )
}
