import type React from "react"
import { AuthProvider } from "./context/AuthContext"
import { AppWithTokenRefresh } from "./components/AppWithTokenRefresh"
import "./styles/auth.css" //"./styles/auth.css"
import "./styles/layout.css" //"./src/styles/layout.css"
import "./styles/notes.css"
import "./styles/trade.css"
import "./styles/trade-modal.css"
import "./styles/trade-offers.css"
import "./styles/dashboard.css"
import "./styles/items.css"
import "./styles/chat.css"
import "./styles/achievements.css"


const App: React.FC = () => {
    return (
        <AuthProvider>
            <AppWithTokenRefresh />
        </AuthProvider>
    )
}

export default App
