export interface User {
    id: number
    username: string
    email: string
    role: "user" | "admin"
    wallet_address?: string
    profile_picture?: string | null
}

export interface LoginRequest {
    email?: string
    username?: string
    password: string
}

export interface RegisterRequest {
    username: string
    email: string
    password: string
    role?: "user" | "admin"
}

export interface AuthResponse {
    token: string
    user: User
}

export interface AuthContextType {
    user: User | null
    token: string | null
    login: (credentials: LoginRequest) => Promise<void>
    register: (userData: RegisterRequest) => Promise<void>
    createAdmin: (userData: RegisterRequest) => Promise<void>
    updateUser: (user: User) => void
    logout: () => void
    isAuthenticated: boolean
    isAdmin: boolean
    loading: boolean
}

export interface ChangePasswordRequest {
    currentPassword: string
    newPassword: string
}

export interface ProfileUpdateRequest {
    username?: string
    email?: string
    wallet_address?: string
    profile_picture?: string | null
}

export interface ProfileResponse {
    user: User
}


