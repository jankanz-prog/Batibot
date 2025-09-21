export const API_CONFIG = {
    BASE_URL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3001/api",
    TIMEOUT: 10000,
}

export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500,
} as const
