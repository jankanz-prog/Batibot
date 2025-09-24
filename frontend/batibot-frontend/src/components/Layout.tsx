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
                                    onClick={() => navigate('/trade')}
                                    className={`nav-button ${location.pathname === '/trade' ? 'active' : ''}`}
                                >
                                    Trade
                                </button>
                                <button
                                    onClick={() => navigate('/trade-offers')}
                                    className={`nav-button ${location.pathname === '/trade-offers' ? 'active' : ''}`}
                                >
                                    Trade Offers
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

                            <div className="header-profile-picture">
                                {user.profile_picture ? (
                                    <img 
                                        src={`http://localhost:3001${user.profile_picture}`} 
                                        alt="Profile" 
                                        onLoad={() => console.log('Layout - Image loaded successfully:', user.profile_picture)}
                                        onError={(e) => console.error('Layout - Image failed to load:', user.profile_picture, e)}
                                    />
                                ) : (
                                    <div className="header-profile-placeholder">
                                        {user.username.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>

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
