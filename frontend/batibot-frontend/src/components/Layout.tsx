import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useCardanoWallet } from "../context/CardanoWalletContext"
import { NotificationBell } from "./NotificationBell"
import { LayoutDashboard, Package, ShoppingBag, MessageSquare, Shield, ArrowLeftRight, FileText, StickyNote, Wallet, User as UserIcon, LogOut } from "lucide-react"
import "../styles/ProfileDropdown.css"

interface LayoutProps {
    children: React.ReactNode
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
    const { user, logout, isAdmin } = useAuth()
    const { walletBalance, refreshBalance, isConnected } = useCardanoWallet()
    const navigate = useNavigate()
    const location = useLocation()
    const [showDropdown, setShowDropdown] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    const navigateToProfile = () => {
        navigate("/profile")
        setShowDropdown(false)
    }

    // Refresh wallet balance every 30 seconds if connected
    useEffect(() => {
        if (isConnected && user?.wallet_address) {
            refreshBalance()
            const interval = setInterval(() => {
                refreshBalance()
            }, 30000)
            return () => clearInterval(interval)
        }
    }, [isConnected, user?.wallet_address, refreshBalance])

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

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
                                    <LayoutDashboard size={18} />
                                    <span>Dashboard</span>
                                </button>
                                <button
                                    onClick={() => navigate('/inventory')}
                                    className={`nav-button ${location.pathname === '/inventory' ? 'active' : ''}`}
                                >
                                    <Package size={18} />
                                    <span>Inventory</span>
                                </button>
                                <button
                                    onClick={() => navigate('/items')}
                                    className={`nav-button ${location.pathname === '/items' ? 'active' : ''}`}
                                >
                                    <ShoppingBag size={18} />
                                    <span>Items</span>
                                </button>
                                <button
                                    onClick={() => navigate('/chat')}
                                    className={`nav-button ${location.pathname === '/chat' ? 'active' : ''}`}
                                >
                                    <MessageSquare size={18} />
                                    <span>Chat</span>
                                </button>
                                {isAdmin && (
                                    <button
                                        onClick={() => navigate('/admin')}
                                        className={`nav-button admin-nav ${location.pathname === '/admin' ? 'active' : ''}`}
                                    >
                                        <Shield size={18} />
                                        <span>Admin</span>
                                    </button>
                                )}
                                <button
                                    onClick={navigateToTrade}
                                    className={`nav-button ${location.pathname === '/trade' ? 'active' : ''}`}
                                >
                                    <ArrowLeftRight size={18} />
                                    <span>Trade</span>
                                </button>
                                <button
                                    onClick={navigateToTradeOffers}
                                    className={`nav-button ${location.pathname === '/trade-offers' ? 'active' : ''}`}
                                >
                                    <FileText size={18} />
                                    <span>Offers</span>
                                </button>
                                <button
                                    onClick={navigateToNotes}
                                    className={`nav-button ${location.pathname === '/notes' ? 'active' : ''}`}
                                >
                                    <StickyNote size={18} />
                                    <span>Notes</span>
                                </button>
                            </nav>

                            <NotificationBell />

                            <div className="profile-dropdown-container" ref={dropdownRef}>
                                <div 
                                    className="header-profile-picture clickable" 
                                    onClick={() => setShowDropdown(!showDropdown)}
                                    title="Click for options"
                                >
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

                                {showDropdown && (
                                    <div className="profile-dropdown">
                                        <div className="dropdown-header">
                                            <span className="dropdown-username">{user.username}</span>
                                            {isAdmin && <span className="admin-badge">Admin</span>}
                                        </div>
                                        
                                        {user.wallet_address && (
                                            <div className="dropdown-wallet-info">
                                                <div className="wallet-balance-item">
                                                    <span className="wallet-label"><Wallet size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />Wallet Balance:</span>
                                                    <span className="wallet-balance">
                                                        {isConnected ? (
                                                            walletBalance ? `${walletBalance} ADA` : 'Loading...'
                                                        ) : (
                                                            <span className="wallet-disconnected-hint">
                                                                Not connected
                                                                <small style={{ display: 'block', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                                                                    Go to Profile to reconnect
                                                                </small>
                                                            </span>
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                        )}

                                        <div className="dropdown-divider" />

                                        <button className="dropdown-item" onClick={navigateToProfile}>
                                            <UserIcon size={16} style={{ marginRight: '0.5rem' }} /> View Profile
                                        </button>

                                        <div className="dropdown-divider" />

                                        <button className="dropdown-item logout-item" onClick={logout}>
                                            <LogOut size={16} style={{ marginRight: '0.5rem' }} /> Logout
                                        </button>
                                    </div>
                                )}
                            </div>

                            <span className="welcome-text">
                                Welcome, {user.username}
                                {isAdmin && <span className="admin-badge">Admin</span>}
                            </span>
                        </div>
                    )}
                </div>
            </header>

            <main className="app-main">{children}</main>

            <footer className="app-footer">
                <div className="footer-content">
                    <div className="footer-section">
                        <h4>About Us</h4>
                        <p>Batibot is a cross-game item trading platform for gamers worldwide.</p>
                    </div>
                    <div className="footer-section">
                        <h4>Quick Links</h4>
                        <a href="#">Terms of Service</a>
                        <a href="#">Privacy Policy</a>
                        <a href="#">FAQ</a>
                    </div>
                    <div className="footer-section">
                        <h4>Contact Us</h4>
                        <p>Email: support@batibot.com</p>
                        <p>Discord: Batibot Community</p>
                    </div>
                    <div className="footer-bottom">
                        <p className="footer-text">&copy; 2024 Batibot. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    )
}
