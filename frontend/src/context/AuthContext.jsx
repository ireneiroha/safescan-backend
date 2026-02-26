import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const token = localStorage.getItem('token')
        if (!token) return null
        try {
            const payload = JSON.parse(atob(token.split('.')[1]))
            if (payload.exp * 1000 < Date.now()) {
                localStorage.removeItem('token')
                return null
            }
            return {
                email: payload.email,
                name: localStorage.getItem('userName') ?? payload.email,
                createdAt: localStorage.getItem('userCreatedAt') ?? new Date().toISOString()
            }
        } catch {
            return null
        }
    })

    const login = (userData, token) => {
        localStorage.setItem('token', token)
        setUser(userData)
    }

    const logout = () => {
        localStorage.removeItem('token')
        setUser(null)
    }

    return (
        <AuthContext.Provider value={{ user, login, logout, isLoggedIn: !!user }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    return useContext(AuthContext)
}