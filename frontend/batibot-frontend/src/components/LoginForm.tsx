
import type React from "react"
import { useState } from "react"
import { useAuth } from "../context/AuthContext"
import type { LoginRequest } from "../types/auth"

interface LoginFormProps {
    onSwitchToRegister: () => void
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToRegister }) => {
    const { login } = useAuth()
    const [formData, setFormData] = useState<LoginRequest>({
        email: "",
        password: "",
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }))
        // Clear error when user starts typing
        if (error) setError(null)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            await login(formData)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Login failed")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="auth-form-container">
            <form onSubmit={handleSubmit} className="auth-form">
                <h2>Login</h2>

                {error && <div className="error-message">{error}</div>}

                <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        disabled={loading}
                        placeholder="Enter your email"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        disabled={loading}
                        placeholder="Enter your password"
                    />
                </div>

                <button type="submit" className="auth-button" disabled={loading}>
                    {loading ? "Logging in..." : "Login"}
                </button>

                <p className="auth-switch">
                    Don't have an account?{" "}
                    <button type="button" className="link-button" onClick={onSwitchToRegister} disabled={loading}>
                        Register here
                    </button>
                </p>
            </form>
        </div>
    )
}
