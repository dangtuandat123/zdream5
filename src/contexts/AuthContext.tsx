import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { authApi, setToken, clearToken, type AuthUser } from '@/lib/api';

interface AuthContextType {
    isLoggedIn: boolean;
    user: AuthUser | null;
    gems: number;
    isAdmin: boolean;
    login: (email: string, password: string) => Promise<void>;
    loginWithToken: (token: string) => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
    updateGems: (gems: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(() => {
        try {
            const saved = localStorage.getItem('auth_user');
            return saved ? JSON.parse(saved) : null;
        } catch {
            return null;
        }
    });

    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
        return !!localStorage.getItem('auth_token');
    });

    // Persist user data vào localStorage
    useEffect(() => {
        if (user) {
            localStorage.setItem('auth_user', JSON.stringify(user));
        } else {
            localStorage.removeItem('auth_user');
        }
    }, [user]);

    // Lấy thông tin user mới nhất từ server
    const refreshUser = useCallback(async () => {
        try {
            const data = await authApi.getUser();
            setUser(data.user);
        } catch {
            // Token hết hạn hoặc lỗi → đăng xuất
            setUser(null);
            setIsLoggedIn(false);
            clearToken();
        }
    }, []);

    // Đăng nhập
    const login = useCallback(async (email: string, password: string) => {
        const data = await authApi.login({ email, password });
        setToken(data.token);
        setUser(data.user);
        setIsLoggedIn(true);
    }, []);

    // Đăng nhập bằng token (Google OAuth)
    const loginWithToken = useCallback(async (token: string) => {
        setToken(token)
        try {
            const data = await authApi.getUser()
            setUser(data.user)
            setIsLoggedIn(true)
        } catch {
            // Token không hợp lệ → xoá ngay để tránh auth state inconsistent
            clearToken()
            throw new Error('Đăng nhập thất bại. Vui lòng thử lại.')
        }
    }, [])

    // Đăng ký
    const register = useCallback(async (name: string, email: string, password: string) => {
        const data = await authApi.register({
            name,
            email,
            password,
            password_confirmation: password,
        });
        setToken(data.token);
        setUser(data.user);
        setIsLoggedIn(true);
    }, []);

    // Đăng xuất
    const logout = useCallback(async () => {
        try {
            await authApi.logout();
        } catch {
            // Bỏ qua lỗi nếu token đã hết hạn
        } finally {
            clearToken();
            setUser(null);
            setIsLoggedIn(false);
        }
    }, []);

    // Cập nhật gems (dùng sau khi tạo ảnh hoặc nạp tiền)
    const updateGems = useCallback((gems: number) => {
        setUser(prev => prev ? { ...prev, gems } : null);
    }, []);

    // Verify token khi khởi động app
    useEffect(() => {
        if (isLoggedIn) {
            refreshUser();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const gems = user?.gems ?? 0;
    const isAdmin = (user?.level ?? 0) >= 2;

    return (
        <AuthContext.Provider value={{
            isLoggedIn,
            user,
            gems,
            isAdmin,
            login,
            loginWithToken,
            register,
            logout,
            refreshUser,
            updateGems,
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
