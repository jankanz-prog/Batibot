import type {
    CreateNoteRequest,
    UpdateNoteRequest,
    NotesResponse,
    NoteResponse,
    DeleteNoteResponse,
} from "../types/notes"
import { API_CONFIG } from "../config/api"

const API_BASE_URL = API_CONFIG.BASE_URL

class NotesAPI {
    private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
        const url = `${API_BASE_URL}${endpoint}`

        // Ensure Content-Type is not overwritten by ...options
        const config: RequestInit = {
            ...options,
            headers: {
                "Content-Type": "application/json",
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

    async createNote(noteData: CreateNoteRequest, token: string): Promise<NoteResponse> {
        return this.makeRequest<NoteResponse>("/auth/notes", {
            method: "POST",
            headers: this.getAuthHeaders(token),
            body: JSON.stringify(noteData),
        })
    }

    async getAllNotes(token: string): Promise<NotesResponse> {
        return this.makeRequest<NotesResponse>("/auth/notes", {
            method: "GET",
            headers: this.getAuthHeaders(token),
        })
    }

    async getNoteById(id: number, token: string): Promise<NoteResponse> {
        return this.makeRequest<NoteResponse>(`/auth/notes/${id}`, {
            method: "GET",
            headers: this.getAuthHeaders(token),
        })
    }

    async updateNote(id: number, noteData: UpdateNoteRequest, token: string): Promise<NoteResponse> {
        return this.makeRequest<NoteResponse>(`/auth/notes/${id}`, {
            method: "PUT",
            headers: this.getAuthHeaders(token),
            body: JSON.stringify(noteData),
        })
    }

    async deleteNote(id: number, token: string): Promise<DeleteNoteResponse> {
        return this.makeRequest<DeleteNoteResponse>(`/auth/notes/${id}`, {
            method: "DELETE",
            headers: this.getAuthHeaders(token),
        })
    }

    async toggleFavorite(id: number, token: string): Promise<NoteResponse> {
        return this.makeRequest<NoteResponse>(`/auth/notes/${id}/toggle-favorite`, {
            method: "PATCH",
            headers: this.getAuthHeaders(token),
        })
    }

    async togglePin(id: number, token: string): Promise<NoteResponse> {
        return this.makeRequest<NoteResponse>(`/auth/notes/${id}/toggle-pin`, {
            method: "PATCH",
            headers: this.getAuthHeaders(token),
        })
    }

    async toggleArchive(id: number, token: string): Promise<NoteResponse> {
        return this.makeRequest<NoteResponse>(`/auth/notes/${id}/toggle-archive`, {
            method: "PATCH",
            headers: this.getAuthHeaders(token),
        })
    }

    async updatePriority(id: number, priority: 'low' | 'medium' | 'high', token: string): Promise<NoteResponse> {
        return this.makeRequest<NoteResponse>(`/auth/notes/${id}/priority`, {
            method: "PATCH",
            headers: this.getAuthHeaders(token),
            body: JSON.stringify({ priority }),
        })
    }

    async updateColor(id: number, color: string | null, token: string): Promise<NoteResponse> {
        return this.makeRequest<NoteResponse>(`/auth/notes/${id}/color`, {
            method: "PATCH",
            headers: this.getAuthHeaders(token),
            body: JSON.stringify({ color }),
        })
    }

    async updateTags(id: number, tags: string[] | null, token: string): Promise<NoteResponse> {
        return this.makeRequest<NoteResponse>(`/auth/notes/${id}/tags`, {
            method: "PATCH",
            headers: this.getAuthHeaders(token),
            body: JSON.stringify({ tags }),
        })
    }

    async setReminder(id: number, reminder: string | null, token: string): Promise<NoteResponse> {
        return this.makeRequest<NoteResponse>(`/auth/notes/${id}/reminder`, {
            method: "PATCH",
            headers: this.getAuthHeaders(token),
            body: JSON.stringify({ reminder }),
        })
    }

    async updateDrawings(id: number, drawings: any | null, token: string): Promise<NoteResponse> {
        return this.makeRequest<NoteResponse>(`/auth/notes/${id}/drawings`, {
            method: "PATCH",
            headers: this.getAuthHeaders(token),
            body: JSON.stringify({ drawings }),
        })
    }

    async uploadAttachments(id: number, files: File[], token: string): Promise<NoteResponse> {
        const formData = new FormData()
        files.forEach(file => {
            formData.append('files', file)
        })

        const url = `${API_BASE_URL}/auth/notes/${id}/attachments`

        const response = await fetch(url, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                // Don't set Content-Type - browser will set it with boundary for FormData
            },
            body: formData,
        })

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
        }

        return await response.json()
    }
}

export const notesAPI = new NotesAPI()