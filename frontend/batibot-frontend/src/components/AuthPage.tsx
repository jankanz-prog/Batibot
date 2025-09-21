
import type React from "react"
import { useState } from "react"
import { LoginForm } from "./LoginForm"
import { RegisterForm } from "./RegisterForm"

type AuthMode = "login" | "register"

export const AuthPage: React.FC = () => {
    const [mode, setMode] = useState<AuthMode>("login")

    return (
        <div className="auth-page">
            <div className="auth-container">
                {mode === "login" ? (
                    <LoginForm onSwitchToRegister={() => setMode("register")} />
                ) : (
                    <RegisterForm onSwitchToLogin={() => setMode("login")} />
                )}
            </div>
        </div>
    )
}
