import type React from "react"
import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import { authAPI } from "../services/authAPI"
import type { ProfileUpdateRequest } from "../types/auth"

export const ProfilePage: React.FC = () => {
    const { user, token, logout } = useAuth()
    const [isEditing, setIsEditing] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")
    const [formData, setFormData] = useState({
        username: user?.username || "",
        email: user?.email || "",
        wallet_address: user?.wallet_address || "",
        profile_picture: user?.profile_picture || null,
    })
    const [previewImage, setPreviewImage] = useState<string | null>(user?.profile_picture || null)

    useEffect(() => {
        if (user) {
            console.log('ProfilePage - User data:', user);
            console.log('ProfilePage - Profile picture path:', user.profile_picture);
            
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
            console.log('ProfilePage - Constructed image URL:', imageUrl);
            setPreviewImage(imageUrl)
        }
    }, [user])

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
                    console.log('Upload response:', response.user);
                    
                    // Update preview with server URL
                    const imageUrl = `http://localhost:3001${response.user.profile_picture}`
                    setPreviewImage(imageUrl)
                    setFormData((prev) => ({
                        ...prev,
                        profile_picture: response.user.profile_picture || null,
                    }))
                    
                    // Update the user context by calling verifyToken to refresh user data
                    try {
                        const verifyResponse = await authAPI.verifyToken(token);
                        if (verifyResponse) {
                            // Force a page refresh to update the AuthContext
                            setTimeout(() => window.location.reload(), 500);
                        }
                    } catch (err) {
                        console.error('Failed to refresh user data:', err);
                        // Fallback to page refresh
                        setTimeout(() => window.location.reload(), 1000);
                    }
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
                // Refresh page to update user context
                setTimeout(() => window.location.reload(), 1000)
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

            <div className="dashboard-content">
                <div className="info-card">
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
                            <label htmlFor="wallet_address">Wallet Address (Optional)</label>
                            <input
                                type="text"
                                id="wallet_address"
                                name="wallet_address"
                                value={formData.wallet_address}
                                onChange={handleInputChange}
                                disabled={!isEditing || loading}
                                placeholder="Enter your wallet address"
                            />
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

                <div className="info-card">
                    <h3>Account Actions</h3>
                    <div className="quick-actions">
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
            </div>
        </div>
    )
}
