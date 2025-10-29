import type React from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { NotificationBell } from "./NotificationBell"

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

    const navigateToTrade = () => {
        navigate("/trade")
    }

    const navigateToTradeOffers = () => {
        navigate("/trade-offers")
    }

    const navigateToNotes = () => {
        navigate("/notes")
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
                            <nav className="nav-menu">
                                <button
                                    onClick={navigateToDashboard}
                                    className={`nav-button ${location.pathname === '/dashboard' ? 'active' : ''}`}
                                >
                                    Dashboard
                                </button>
                                <button
                                    onClick={() => navigate('/inventory')}
                                    className={`nav-button ${location.pathname === '/inventory' ? 'active' : ''}`}
                                >
                                     Inventory
                                </button>
                                <button
                                    onClick={() => navigate('/items')}
                                    className={`nav-button ${location.pathname === '/items' ? 'active' : ''}`}
                                >
                                     Items
                                </button>
                                <button
                                    onClick={() => navigate('/chat')}
                                    className={`nav-button ${location.pathname === '/chat' ? 'active' : ''}`}
                                >
                                    💬 Chat
                                </button>
                                {isAdmin && (
                                    <button
                                        onClick={() => navigate('/admin')}
                                        className={`nav-button admin-nav ${location.pathname === '/admin' ? 'active' : ''}`}
                                    >
                                         Admin
                                    </button>
                                )}
                                <button
                                    onClick={navigateToTrade}
                                    className={`nav-button ${location.pathname === '/trade' ? 'active' : ''}`}
                                >
                                    Trade
                                </button>
                                <button
                                    onClick={navigateToTradeOffers}
                                    className={`nav-button ${location.pathname === '/trade-offers' ? 'active' : ''}`}
                                >
                                    Trade Offers
                                </button>
                                <button
                                    onClick={navigateToNotes}
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

                            <NotificationBell />

                            <div className="header-profile-picture">
                                {user.profile_picture ? (
                                    <img 
                                        src={`http://localhost:3001${user.profile_picture}`} 
                                        alt="Profile" 
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
