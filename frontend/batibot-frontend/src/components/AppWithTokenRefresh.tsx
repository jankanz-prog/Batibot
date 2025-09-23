import React from "react"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { useTokenRefresh } from "../hooks/useTokenRefresh"
import { ProtectedRoute } from "./ProtectedRoute"
import { Layout } from "./Layout"
import { Dashboard } from "./Dashboard"
import { ProfilePage } from "./ProfilePage"
import { NotesPage } from "./NotesPage"
import { TradePage } from "./TradePage"
import { TradeOffersPage } from "./TradeOffersPage"

export const AppWithTokenRefresh: React.FC = () => {
    useTokenRefresh()

    return (
        <Router>
            <ProtectedRoute>
                <Layout>
                    <Routes>
                        <Route path="/" element={<Navigate to="/dashboard" replace />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/trade" element={<TradePage />} />
                        <Route path="/trade-offers" element={<TradeOffersPage />} />
                        <Route path="/profile" element={<ProfilePage />} />
                        <Route path="/notes" element={<NotesPage />} />
                        <Route path="*" element={<Navigate to="/dashboard" replace />} />
                    </Routes>
                </Layout>
            </ProtectedRoute>
        </Router>
    )
}
