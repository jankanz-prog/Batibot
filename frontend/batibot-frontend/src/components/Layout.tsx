import type React from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

interface LayoutProps {
    children: React.ReactNode
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
    const { user, logout, isAdmin } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()

    const navigateToProfile = () => {
        navigate("/profile")
    }

    const navigateToDashboard = () => {
        navigate("/dashboard")
    }

    return (
        <div className="app-layout">
            <header className="app-header">
                <div className="header-content">
                    <h1 className="app-title" onClick={navigateToDashboard} style={{ cursor: "pointer" }}>
                        Batibot App
                    </h1>

                    {user && (
                        <div className="user-info">
                            <nav className="nav-buttons">
                                <button
                                    onClick={navigateToDashboard}
                                    className={`nav-button ${location.pathname === '/dashboard' ? 'active' : ''}`}
                                >
                                    Dashboard
                                </button>
                                <button
                                    onClick={() => navigate('/notes')}
                                    className={`nav-button ${location.pathname === '/notes' ? 'active' : ''}`}
                                >
                                    Notes
                                </button>
                                <button
                                    onClick={navigateToProfile}
                                    className={`nav-button ${location.pathname === '/profile' ? 'active' : ''}`}
                                >
                                    Profile
                                </button>
                            </nav>

                            <span className="welcome-text">
                                Welcome, {user.username}
                                {isAdmin && <span className="admin-badge">Admin</span>}
                            </span>
                            <button onClick={logout} className="logout-button">
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </header>

            <main className="app-main">{children}</main>

            <footer className="app-footer">
                <p>&copy; 2024 Batibot App. All rights reserved.</p>
            </footer>
        </div>
    )
}
