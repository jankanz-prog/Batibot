
import type React from "react"
import { useAuth } from "../context/AuthContext"
import { AuthPage } from "./AuthPage"

interface ProtectedRouteProps {
    children: React.ReactNode
    requireAdmin?: boolean
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireAdmin = false }) => {
    const { isAuthenticated, isAdmin, loading } = useAuth()

    // Show loading spinner while checking authentication
    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading...</p>
            </div>
        )
    }

    // If not authenticated, show auth page
    if (!isAuthenticated) {
        return <AuthPage />
    }

    // If admin required but user is not admin, show access denied
    if (requireAdmin && !isAdmin) {
        return (
            <div className="access-denied">
                <h2>Access Denied</h2>
                <p>You need admin privileges to access this page.</p>
            </div>
        )
    }

    // User is authenticated and has required permissions
    return <>{children}</>
}
