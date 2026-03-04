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
                name: localStorage.getItem(`userName_${payload.email}`) ?? payload.email.split('@')[0],
                createdAt: localStorage.getItem(`userCreatedAt_${payload.email}`) ?? new Date().toISOString()
            }
        } catch {
            return null
        }
    })

    const login = (userData, token) => {
        localStorage.setItem('token', token)
        localStorage.removeItem('guestScanCount') // reset on login
        // store name against the specific email so different users get their own name
        if (userData.name) {
            localStorage.setItem(`userName_${userData.email}`, userData.name)
        }
        if (userData.createdAt) {
            localStorage.setItem(`userCreatedAt_${userData.email}`, userData.createdAt)
        }
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