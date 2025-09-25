import type React from "react"
import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { User, AuthContextType, LoginRequest, RegisterRequest } from "../types/auth"
import { authAPI } from "../services/authAPI"
import { tokenStorage } from "../utils/tokenStorage"

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider")
    }
    return context
}

interface AuthProviderProps {
    children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null)
    const [token, setToken] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    // Initialize auth state from localStorage
    useEffect(() => {
        const initializeAuth = async () => {
            const storedToken = tokenStorage.getToken()
            const storedUser = tokenStorage.getUser()

            if (storedToken && storedUser) {
                try {
                    // Verify token is still valid
                    const isValid = await authAPI.verifyToken(storedToken)
                    if (isValid) {
                        setToken(storedToken)
                        setUser(storedUser)
                    } else {
                        // Token is invalid, clear storage
                        tokenStorage.clearAll()
                    }
                } catch (error) {
                    console.error("Token verification failed:", error)
                    tokenStorage.clearAll()
                }
            }
            setLoading(false)
        }

        initializeAuth()
    }, [])

    const login = async (credentials: LoginRequest) => {
        try {
            const response = await authAPI.login(credentials)
            setUser(response.user)
            setToken(response.token)

            // Store in localStorage for persistence
            tokenStorage.setToken(response.token)
            tokenStorage.setUser(response.user)
        } catch (error) {
            throw error
        }
    }

    const register = async (userData: RegisterRequest) => {
        try {
            const response = await authAPI.register(userData)
            setUser(response.user)
            setToken(response.token)

            // Store in localStorage for persistence
            tokenStorage.setToken(response.token)
            tokenStorage.setUser(response.user)
        } catch (error) {
            throw error
        }
    }

    const createAdmin = async (userData: RegisterRequest) => {
        try {
            const response = await authAPI.createAdmin(userData)
            // Note: createAdmin might not return user data, handle accordingly
            if (response.user && response.token) {
                setUser(response.user)
                setToken(response.token)
                tokenStorage.setToken(response.token)
                tokenStorage.setUser(response.user)
            }
        } catch (error) {
            throw error
        }
    }

    const updateUser = (updatedUser: User) => {
        setUser(updatedUser)
        tokenStorage.setUser(updatedUser)
    }

    const logout = () => {
        setUser(null)
        setToken(null)
        tokenStorage.clearAll()
    }

    const value: AuthContextType = {
        user,
        token,
        login,
        register,
        createAdmin,
        updateUser,
        logout,
        isAuthenticated: !!user && !!token,
        isAdmin: user?.role === "admin",
        loading,
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
