import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
    isLoggedIn: boolean;
    login: () => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    // Initialize from localStorage if available, otherwise default to false
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
        const saved = localStorage.getItem('isLoggedIn');
        return saved === 'true';
    });

    // Persist auth state to localStorage
    useEffect(() => {
        localStorage.setItem('isLoggedIn', String(isLoggedIn));
    }, [isLoggedIn]);

    const login = () => setIsLoggedIn(true);
    const logout = () => setIsLoggedIn(false);

    return (
        <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
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
