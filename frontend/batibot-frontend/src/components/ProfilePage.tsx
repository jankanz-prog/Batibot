import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useCardanoWallet } from "../context/CardanoWalletContext"
import { authAPI } from "../services/authAPI"
import type { ProfileUpdateRequest } from "../types/auth"
import { WalletInstructionModal } from "./WalletInstructionModal"
import { SendTransactionModal } from "./SendTransactionModal"
import { TransactionHistory } from "./TransactionHistory"
import { WalletMismatchModal } from "./WalletMismatchModal"
import { Core } from '@blaze-cardano/sdk'
import '../styles/profile.css'

export const ProfilePage: React.FC = () => {
    const { user, token, logout, updateUser } = useAuth()
    const { 
        walletAddress, 
        availableWallets, 
        isConnecting, 
        isConnected, 
        connectWallet, 
        disconnectWallet 
    } = useCardanoWallet()
    const navigate = useNavigate()
    const [isEditing, setIsEditing] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")
    const [showInstructionModal, setShowInstructionModal] = useState(false)
    const [showSendModal, setShowSendModal] = useState(false)
    const [showMismatchModal, setShowMismatchModal] = useState(false)
    const [selectedWalletName, setSelectedWalletName] = useState<string>("")
    const [formData, setFormData] = useState({
        username: user?.username || "",
        email: user?.email || "",
        wallet_address: user?.wallet_address || "",
        profile_picture: user?.profile_picture || null,
    })
    const [previewImage, setPreviewImage] = useState<string | null>(user?.profile_picture || null)

    useEffect(() => {
        if (user) {
            setFormData({
                username: user.username,
                email: user.email,
                wallet_address: user.wallet_address || "",
                profile_picture: user.profile_picture || null,
            })
            // Set preview image with full URL if it exists
            const imageUrl = user.profile_picture 
                ? `http://localhost:3001${user.profile_picture}` 
                : null
            setPreviewImage(imageUrl)
        }
    }, [user])

    // Check for wallet mismatch
    useEffect(() => {
        if (user?.wallet_address && isConnected && walletAddress) {
            // Compare saved wallet address with connected wallet address
            if (user.wallet_address !== walletAddress) {
                setShowMismatchModal(true)
            } else {
                setShowMismatchModal(false)
            }
        }
    }, [user?.wallet_address, isConnected, walletAddress])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file && token) {
            try {
                setLoading(true)
                setError("")
                
                const response = await authAPI.uploadProfilePicture(file, token)
                if (response.user) {
                    setSuccess("Profile picture updated successfully!")
                    
                    // Update preview with server URL
                    const imageUrl = `http://localhost:3001${response.user.profile_picture}`
                    setPreviewImage(imageUrl)
                    setFormData((prev) => ({
                        ...prev,
                        profile_picture: response.user.profile_picture || null,
                    }))
                    
                    // Update the user context directly (no page reload needed!)
                    updateUser(response.user);
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to upload image")
            } finally {
                setLoading(false)
            }
        }
    }

    const handleDeleteProfilePicture = async () => {
        if (!token) return
        
        try {
            setLoading(true)
            setError("")
            
            const response = await authAPI.deleteProfilePicture(token)
            if (response.user) {
                setSuccess("Profile picture deleted successfully!")
                setPreviewImage(null)
                setFormData((prev) => ({
                    ...prev,
                    profile_picture: null,
                }))
                // Update the user context directly (no page reload needed!)
                updateUser(response.user);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to delete profile picture")
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!token) return

        setLoading(true)
        setError("")
        setSuccess("")

        try {
            const updateData: ProfileUpdateRequest = {}

            if (formData.username !== user?.username) {
                updateData.username = formData.username
            }
            if (formData.email !== user?.email) {
                updateData.email = formData.email
            }
            if (formData.wallet_address !== user?.wallet_address) {
                updateData.wallet_address = formData.wallet_address
            }
            // Profile picture is handled separately via file upload

            if (Object.keys(updateData).length === 0) {
                setError("No changes detected")
                return
            }

            await authAPI.updateProfile(updateData, token)
            setSuccess("Profile updated successfully!")
            setIsEditing(false)

            // Refresh the page to get updated user data
            window.location.reload()
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to update profile")
        } finally {
            setLoading(false)
        }
    }

    const handleCancel = () => {
        setFormData({
            username: user?.username || "",
            email: user?.email || "",
            wallet_address: user?.wallet_address || "",
            profile_picture: user?.profile_picture || null,
        })
        setPreviewImage(user?.profile_picture || null)
        setIsEditing(false)
        setError("")
        setSuccess("")
    }

    const handleMismatchDisconnect = () => {
        disconnectWallet()
        setShowMismatchModal(false)
        setSuccess("Wallet disconnected. Please connect the correct wallet or choose a different one.")
    }

    const handleConnectWallet = async () => {
        if (availableWallets.length === 0) {
            setShowInstructionModal(true)
            return
        }

        if (!selectedWalletName) {
            setError("Please select a wallet")
            return
        }

        try {
            setError("")
            await connectWallet(selectedWalletName)
            
            // Give it a moment for the wallet to fully connect
            setTimeout(async () => {
                // Convert hex address to bech32 and save to profile
                if (walletAddress) {
                    const bech32Address = Core.Address.fromBytes(walletAddress as any).toBech32()
                    
                    // Only save if it's different from saved address
                    if (user?.wallet_address !== bech32Address) {
                        try {
                            // Update profile with wallet address
                            await authAPI.updateProfile({ wallet_address: bech32Address }, token!)
                            
                            // Update user context
                            if (user) {
                                updateUser({ ...user, wallet_address: bech32Address })
                            }
                            setSuccess("Wallet connected successfully! Balance will update shortly.")
                        } catch (apiError: any) {
                            // Disconnect wallet if it's already used by another user
                            disconnectWallet()
                            setError(apiError.message || "This wallet is already in use by another account.")
                            return
                        }
                    } else {
                        setSuccess("Wallet connected successfully! Balance will update shortly.")
                    }
                }
            }, 500)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to connect wallet")
        }
    }

    const handleDisconnectWallet = async () => {
        try {
            disconnectWallet()
            
            // Remove wallet address from profile
            await authAPI.updateProfile({ wallet_address: "" }, token!)
            setSuccess("Wallet disconnected successfully!")
            
            // Update user context
            if (user) {
                updateUser({ ...user, wallet_address: "" })
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to disconnect wallet")
        }
    }

    // Sync wallet connection with user's stored address on mount
    useEffect(() => {
        if (user?.wallet_address && !isConnected && availableWallets.length > 0) {
            // Auto-select lace if available
            const walletToUse = availableWallets.includes('lace') ? 'lace' : availableWallets[0]
            setSelectedWalletName(walletToUse)
        }
    }, [user, isConnected, availableWallets])

    if (!user) {
        return (
            <div className="access-denied">
                <h2>Access Denied</h2>
                <p>Please log in to view your profile.</p>
            </div>
        )
    }

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <h2>My Profile</h2>
                <p>Manage your account information</p>
            </div>

            <div className="dashboard-content profile-grid">
                <div className="info-card profile-info-card">
                    <h3>Profile Information</h3>

                    {error && <div className="error-message">{error}</div>}
                    {success && <div className="success-message">{success}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Profile Picture</label>
                            <div className="profile-picture-section">
                                <div className="profile-picture-preview">
                                    {previewImage ? (
                                        <img 
                                            src={previewImage} 
                                            alt="Profile Preview" 
                                            className="profile-picture-img"
                                        />
                                    ) : (
                                        <div className="profile-picture-placeholder">
                                            <span>No Image</span>
                                        </div>
                                    )}
                                </div>
                                {isEditing && (
                                    <div className="profile-picture-controls">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            disabled={loading}
                                            className="profile-picture-input"
                                        />
                                        {previewImage && (
                                            <button
                                                type="button"
                                                onClick={handleDeleteProfilePicture}
                                                disabled={loading}
                                                className="btn btn-danger"
                                                style={{ marginTop: '0.5rem' }}
                                            >
                                                Delete Picture
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="username">Username</label>
                            <input
                                type="text"
                                id="username"
                                name="username"
                                value={formData.username}
                                onChange={handleInputChange}
                                disabled={!isEditing || loading}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                disabled={!isEditing || loading}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Cardano Wallet Connection</label>
                            {user.wallet_address ? (
                                <div className="wallet-connected">
                                    <div className="wallet-info">
                                        <p><strong>Saved Address:</strong></p>
                                        <p className="wallet-address">{user.wallet_address}</p>
                                        {!isConnected && (
                                            <div style={{ 
                                                marginTop: '0.75rem', 
                                                padding: '0.75rem', 
                                                background: '#fff3e0', 
                                                borderRadius: '6px',
                                                border: '1px solid #ff9800'
                                            }}>
                                                <p style={{ margin: '0 0 0.5rem 0', color: '#ff9800', fontWeight: 500 }}>
                                                    ⚠️ Wallet not connected in this session
                                                </p>
                                                <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.9rem', color: '#666' }}>
                                                    Connect your wallet to view balance and send transactions
                                                </p>
                                                <div className="wallet-connect-form">
                                                    <select
                                                        value={selectedWalletName}
                                                        onChange={(e) => setSelectedWalletName(e.target.value)}
                                                        className="wallet-select"
                                                    >
                                                        <option value="">Select Wallet</option>
                                                        {availableWallets.map((wallet) => (
                                                            <option key={wallet} value={wallet}>
                                                                {wallet.charAt(0).toUpperCase() + wallet.slice(1)}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <button
                                                        type="button"
                                                        onClick={handleConnectWallet}
                                                        disabled={isConnecting || !selectedWalletName}
                                                        className="btn btn-primary"
                                                        style={{ marginTop: '0.5rem' }}
                                                    >
                                                        {isConnecting ? "Reconnecting..." : "Reconnect Wallet"}
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleDisconnectWallet}
                                        className="btn btn-danger"
                                        style={{ marginTop: '0.5rem' }}
                                    >
                                        Disconnect Wallet
                                    </button>
                                </div>
                            ) : (
                                <div className="wallet-not-connected">
                                    {availableWallets.length === 0 ? (
                                        <div className="no-wallet-prompt">
                                            <p>No Cardano wallet detected.</p>
                                            <button
                                                type="button"
                                                onClick={() => setShowInstructionModal(true)}
                                                className="btn btn-info"
                                            >
                                                No wallet connected. Create now?
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="wallet-connect-form">
                                            <select
                                                value={selectedWalletName}
                                                onChange={(e) => setSelectedWalletName(e.target.value)}
                                                className="wallet-select"
                                            >
                                                <option value="">Select Wallet</option>
                                                {availableWallets.map((wallet) => (
                                                    <option key={wallet} value={wallet}>
                                                        {wallet.charAt(0).toUpperCase() + wallet.slice(1)}
                                                    </option>
                                                ))}
                                            </select>
                                            <button
                                                type="button"
                                                onClick={handleConnectWallet}
                                                disabled={isConnecting || !selectedWalletName}
                                                className="btn btn-primary"
                                                style={{ marginTop: '0.5rem' }}
                                            >
                                                {isConnecting ? "Connecting..." : "Connect Wallet"}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="form-group">
                            <label>Role</label>
                            <input
                                type="text"
                                value={user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                disabled
                                style={{ backgroundColor: "#f8f9fa", cursor: "not-allowed" }}
                            />
                        </div>

                        <div className="profile-actions">
                            {!isEditing ? (
                                <button type="button" onClick={() => setIsEditing(true)} className="action-button">
                                    Edit Profile
                                </button>
                            ) : (
                                <div className="edit-actions">
                                    <button type="submit" disabled={loading} className="auth-button" style={{ marginRight: "1rem" }}>
                                        {loading ? "Saving..." : "Save Changes"}
                                    </button>
                                    <button type="button" onClick={handleCancel} disabled={loading} className="cancel-button">
                                        Cancel
                                    </button>
                                </div>
                            )}
                        </div>
                    </form>
                </div>

                <div className="side-column">
                    <div className="info-card">
                        <h3>Account Actions</h3>
                        <div className="quick-actions">
                            <button
                                onClick={() => navigate('/profile/achievements')}
                                className="action-button achievements-link"
                            >
                                View Achievements
                            </button>
                            <button
                                onClick={() => {
                                    /* Add change password functionality */
                                }}
                                className="action-button"
                            >
                                Change Password
                            </button>
                            <button onClick={logout} className="action-button" style={{ borderColor: "#dc3545", color: "#dc3545" }}>
                                Logout
                            </button>
                        </div>
                    </div>

                    {/* Cardano Wallet Actions */}
                    {user?.wallet_address && isConnected && (
                        <div className="info-card wallet-actions-card">
                            <h3>Wallet Actions</h3>
                            <div className="quick-actions">
                                <button
                                    onClick={() => setShowSendModal(true)}
                                    className="action-button"
                                    style={{ 
                                        borderColor: "var(--accent-primary)", 
                                        color: "var(--accent-primary)",
                                        fontWeight: 600
                                    }}
                                >
                                    Send ADA
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Transaction History - Full Width */}
            {user?.wallet_address && (
                <div className="transaction-history-container">
                    <TransactionHistory walletAddress={user.wallet_address} />
                </div>
            )}

            <WalletInstructionModal 
                isOpen={showInstructionModal} 
                onClose={() => setShowInstructionModal(false)} 
            />

            <SendTransactionModal
                isOpen={showSendModal}
                onClose={() => setShowSendModal(false)}
                onSuccess={() => {
                    setSuccess("Transaction sent successfully!")
                    // Transaction history will auto-refresh
                }}
            />

            <WalletMismatchModal
                isOpen={showMismatchModal}
                onClose={() => setShowMismatchModal(false)}
                expectedWallet={user?.wallet_address || ''}
                connectedWallet={walletAddress || ''}
                onDisconnect={handleMismatchDisconnect}
            />
        </div>
    )
}
