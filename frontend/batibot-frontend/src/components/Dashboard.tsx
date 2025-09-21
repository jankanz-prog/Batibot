"use client"

import type React from "react"
import { useAuth } from "../context/AuthContext"

export const Dashboard: React.FC = () => {
    const { user, isAdmin } = useAuth()

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <h2>Dashboard</h2>
                <p>Welcome to your personal dashboard, {user?.username}!</p>
            </div>

            <div className="dashboard-content">
                <div className="info-card">
                    <h3>Your Profile</h3>
                    <div className="profile-info">
                        <p>
                            <strong>Username:</strong> {user?.username}
                        </p>
                        <p>
                            <strong>Email:</strong> {user?.email}
                        </p>
                        <p>
                            <strong>Role:</strong> {user?.role}
                        </p>
                        {user?.wallet_address && (
                            <p>
                                <strong>Wallet:</strong> {user.wallet_address}
                            </p>
                        )}
                    </div>
                </div>

                {isAdmin && (
                    <div className="info-card admin-card">
                        <h3>Admin Panel</h3>
                        <p>You have administrator privileges.</p>
                        <div className="admin-actions">
                            <button className="admin-button">Manage Users</button>
                            <button className="admin-button">System Settings</button>
                            <button className="admin-button">View Reports</button>
                        </div>
                    </div>
                )}

                <div className="info-card">
                    <h3>Quick Actions</h3>
                    <div className="quick-actions">
                        <button className="action-button">Update Profile</button>
                        <button className="action-button">Change Password</button>
                        <button className="action-button">View Activity</button>
                    </div>
                </div>
            </div>
        </div>
    )
}
