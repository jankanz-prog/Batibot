export interface Attachment {
    name: string
    url: string
    size: number
    type: string
    uploadedAt?: string
}

export interface DrawingData {
    elements: any[]
    appState: any
    files?: any
}

export interface Note {
    id: number
    title: string
    content: string
    created_at: string
    updated_at: string
    user_id: number
    favorited: boolean
    color?: string | null
    priority: 'low' | 'medium' | 'high'
    pinned: boolean
    archived: boolean
    tags: string[] | null
    attachments: Attachment[] | null
    drawings?: DrawingData | null
    reminder?: string | null
}

export interface CreateNoteRequest {
    title: string
    content: string
    color?: string | null
    priority?: 'low' | 'medium' | 'high'
    pinned?: boolean
    archived?: boolean
    tags?: string[] | null
    attachments?: Attachment[] | null
    drawings?: DrawingData | null
    reminder?: string | null
}

export interface UpdateNoteRequest {
    title: string
    content: string
    color?: string | null
    priority?: 'low' | 'medium' | 'high'
    pinned?: boolean
    archived?: boolean
    tags?: string[] | null
    attachments?: Attachment[] | null
    drawings?: DrawingData | null
    reminder?: string | null
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
