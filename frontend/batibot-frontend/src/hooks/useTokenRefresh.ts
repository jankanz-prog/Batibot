
import { useEffect, useCallback } from "react"
import { useAuth } from "../context/AuthContext"
import { authAPI } from "../services/authAPI"

export const useTokenRefresh = () => {
    const { token, logout } = useAuth()

    const checkTokenValidity = useCallback(async () => {
        if (!token) return

        try {
            const isValid = await authAPI.verifyToken(token)
            if (!isValid) {
                console.warn("Token is invalid, logging out")
                logout()
            }
        } catch (error) {
            console.error("Token verification failed:", error)
            logout()
        }
    }, [token, logout])

    // Check token validity on mount and periodically
    useEffect(() => {
        if (!token) return

        // Check immediately
        checkTokenValidity()

        // Set up periodic checks (every 5 minutes)
        const interval = setInterval(checkTokenValidity, 5 * 60 * 1000)

        return () => clearInterval(interval)
    }, [checkTokenValidity, token])

    // Check token validity when the page becomes visible again
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === "visible" && token) {
                checkTokenValidity()
            }
        }

        document.addEventListener("visibilitychange", handleVisibilityChange)
        return () => document.removeEventListener("visibilitychange", handleVisibilityChange)
    }, [checkTokenValidity, token])

    return { checkTokenValidity }
}
