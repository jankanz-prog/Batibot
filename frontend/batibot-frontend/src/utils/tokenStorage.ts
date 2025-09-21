import type { User } from "../types/auth"

export const tokenStorage = {
    TOKEN_KEY: "authToken",
    USER_KEY: "authUser",
    REFRESH_THRESHOLD: 5 * 60 * 1000, // 5 minutes in milliseconds

    setToken(token: string): void {
        try {
            localStorage.setItem(this.TOKEN_KEY, token)
        } catch (error) {
            console.error("Failed to store token:", error)
        }
    },

    getToken(): string | null {
        try {
            return localStorage.getItem(this.TOKEN_KEY)
        } catch (error) {
            console.error("Failed to retrieve token:", error)
            return null
        }
    },

    setUser(user: User): void {
        try {
            localStorage.setItem(this.USER_KEY, JSON.stringify(user))
        } catch (error) {
            console.error("Failed to store user data:", error)
        }
    },

    getUser(): User | null {
        try {
            const userData = localStorage.getItem(this.USER_KEY)
            return userData ? JSON.parse(userData) : null
        } catch (error) {
            console.error("Failed to retrieve user data:", error)
            return null
        }
    },

    clearAll(): void {
        try {
            localStorage.removeItem(this.TOKEN_KEY)
            localStorage.removeItem(this.USER_KEY)
        } catch (error) {
            console.error("Failed to clear storage:", error)
        }
    },

    // Check if token is close to expiration (if you implement JWT expiration checking)
    isTokenExpiringSoon(token: string): boolean {
        try {
            // This is a basic implementation - you might want to decode JWT and check exp claim
            const payload = JSON.parse(atob(token.split(".")[1]))
            const exp = payload.exp * 1000 // Convert to milliseconds
            const now = Date.now()
            return exp - now < this.REFRESH_THRESHOLD
        } catch (error) {
            // If we can't parse the token, assume it's expiring
            return true
        }
    },
}
