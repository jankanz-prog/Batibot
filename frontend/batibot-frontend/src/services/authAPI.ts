// src/services/authAPI.ts
import type {
    LoginRequest,
    RegisterRequest,
    AuthResponse,
    ChangePasswordRequest,
    ProfileUpdateRequest,
    ProfileResponse
} from "../types/auth"
import { API_CONFIG } from "../config/api"

const API_BASE_URL = API_CONFIG.BASE_URL

class AuthAPI {
    private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
        const url = `${API_BASE_URL}${endpoint}`

        // Ensure Content-Type is preserved, but don't override for FormData
        const config: RequestInit = {
            ...options,
            headers: {
                // Only set Content-Type if not already set (for FormData)
                ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
                ...(options.headers || {}),
            },
        }

        try {
            const response = await fetch(url, config)

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
            }

            return await response.json()
        } catch (error) {
            if (error instanceof Error) {
                throw error
            }
            throw new Error("An unexpected error occurred")
        }
    }

    private getAuthHeaders(token: string) {
        return {
            Authorization: `Bearer ${token}`,
        }
    }

    async login(credentials: LoginRequest): Promise<AuthResponse> {
        return this.makeRequest<AuthResponse>("/auth/login", {
            method: "POST",
            body: JSON.stringify(credentials),
        })
    }

    async register(userData: RegisterRequest): Promise<AuthResponse> {
        return this.makeRequest<AuthResponse>("/auth/register", {
            method: "POST",
            body: JSON.stringify(userData),
        })
    }

    async createAdmin(userData: RegisterRequest): Promise<AuthResponse> {
        return this.makeRequest<AuthResponse>("/auth/create-admin", {
            method: "POST",
            body: JSON.stringify(userData),
        })
    }

    async changePassword(passwordData: ChangePasswordRequest, token: string): Promise<{ message: string }> {
        return this.makeRequest<{ message: string }>("/auth/change-password", {
            method: "PUT",
            headers: this.getAuthHeaders(token),
            body: JSON.stringify(passwordData),
        })
    }

    async verifyToken(token: string): Promise<boolean> {
        try {
            await this.makeRequest("/auth/verify-token", {
                method: "GET",
                headers: this.getAuthHeaders(token),
            })
            return true
        } catch (error) {
            return false
        }
    }

    async getProfile(token: string): Promise<ProfileResponse> {
        return this.makeRequest<ProfileResponse>("/auth/profile", {
            method: "GET",
            headers: this.getAuthHeaders(token),
        })
    }

    async updateProfile(profileData: ProfileUpdateRequest, token: string): Promise<ProfileResponse> {
        return this.makeRequest<ProfileResponse>("/auth/profile", {
            method: "PUT",
            headers: this.getAuthHeaders(token),
            body: JSON.stringify(profileData),
        })
    }

    async uploadProfilePicture(file: File, token: string): Promise<ProfileResponse> {
        const formData = new FormData()
        formData.append('profilePicture', file)

        return this.makeRequest<ProfileResponse>("/auth/profile-picture", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                // Don't set Content-Type, let browser set it for FormData
            },
            body: formData,
        })
    }

    async deleteProfilePicture(token: string): Promise<ProfileResponse> {
        return this.makeRequest<ProfileResponse>("/auth/profile-picture", {
            method: "DELETE",
            headers: this.getAuthHeaders(token),
        })
    }
}

export const authAPI = new AuthAPI()