export interface Note {
    id: number
    title: string
    content: string
    created_at: string
    updated_at: string
    user_id: number
}

export interface CreateNoteRequest {
    title: string
    content: string
}

export interface UpdateNoteRequest {
    title: string
    content: string
}

export interface NotesResponse {
    success: boolean
    message: string
    data: Note[]
}

export interface NoteResponse {
    success: boolean
    message: string
    data: Note
}

export interface DeleteNoteResponse {
    success: boolean
    message: string
}
