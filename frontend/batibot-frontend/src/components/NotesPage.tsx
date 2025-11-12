import type React from "react"
import { useEffect, useState } from "react"
import { useAuth } from "../context/AuthContext"
import { notesAPI } from "../services/notesAPI"
import type { CreateNoteRequest, Note, UpdateNoteRequest } from "../types/notes"
import { Plus, Search, Star, Edit2, Trash2, X } from "lucide-react"
import "../styles/notes.css"

export const NotesPage: React.FC = () => {
    const { token } = useAuth()

    const [notes, setNotes] = useState<Note[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const [searchTerm, setSearchTerm] = useState("")
    const [colorFilter, setColorFilter] = useState<string | null>(null)

    const [isCreating, setIsCreating] = useState(false)
    const [newNote, setNewNote] = useState<CreateNoteRequest>({ title: "", content: "" })

    const [editingNote, setEditingNote] = useState<Note | null>(null)
    const [editForm, setEditForm] = useState<UpdateNoteRequest>({ title: "", content: "" })

    const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)

    useEffect(() => {
        if (!token) return
        void fetchNotes()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token])

    const fetchNotes = async () => {
        if (!token) return
        try {
            setLoading(true)
            setError(null)
            const res = await notesAPI.getAllNotes(token)
            if (res.success) {
                setNotes(res.data)
            } else {
                setError(res.message || "Failed to fetch notes")
            }
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to fetch notes")
        } finally {
            setLoading(false)
        }
    }

    const handleCreateNote = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!token) return

        const title = newNote.title.trim()
        const content = newNote.content.trim()

        if (!title || !content) {
            setError("Both title and content are required")
            return
        }

        try {
            setError(null)
            const res = await notesAPI.createNote({ title, content }, token)
            if (res.success) {
                setNotes(prev => [res.data, ...prev])
                setNewNote({ title: "", content: "" })
                setIsCreating(false)
            } else {
                setError(res.message || "Failed to create note")
            }
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to create note")
        }
    }

    const startEdit = (note: Note) => {
        setEditingNote(note)
        setEditForm({ title: note.title, content: note.content ?? "" })
        setError(null)
    }

    const handleEditNote = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!token || !editingNote) return

        const title = editForm.title.trim()
        const content = editForm.content.trim()

        if (!title || !content) {
            setError("Both title and content are required")
            return
        }

        try {
            setError(null)
            const res = await notesAPI.updateNote(editingNote.id, { title, content }, token)
            if (res.success) {
                setNotes(prev => prev.map(n => (n.id === editingNote.id ? res.data : n)))
                setEditingNote(null)
                setEditForm({ title: "", content: "" })
            } else {
                setError(res.message || "Failed to update note")
            }
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to update note")
        }
    }

    const handleDeleteNote = async (id: number) => {
        if (!token) return
        try {
            setError(null)
            const res = await notesAPI.deleteNote(id, token)
            if (res.success) {
                setNotes(prev => prev.filter(n => n.id !== id))
                setDeleteConfirm(null)
            } else {
                setError(res.message || "Failed to delete note")
            }
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to delete note")
        }
    }

    const handleToggleFavorite = async (id: number) => {
        if (!token) return
        try {
            setError(null)
            const res = await notesAPI.toggleFavorite(id, token)
            if (res.success) {
                setNotes(prev => prev.map(n => (n.id === id ? res.data : n)))
            } else {
                setError(res.message || "Failed to toggle favorite")
            }
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to toggle favorite")
        }
    }

    // Extract hashtags from content
    const extractHashtags = (text: string): string[] => {
        const hashtagRegex = /#[\w]+/g
        return text.match(hashtagRegex) || []
    }

    // Get color theme from hashtags
    const getNoteColor = (note: Note): string => {
        const content = note.content || ""
        if (content.includes("#red") || content.includes("#urgent") || content.includes("#important")) return "red"
        if (content.includes("#blue") || content.includes("#info") || content.includes("#note")) return "blue"
        if (content.includes("#green") || content.includes("#success") || content.includes("#done")) return "green"
        if (content.includes("#yellow") || content.includes("#warning") || content.includes("#todo")) return "yellow"
        if (content.includes("#purple") || content.includes("#idea") || content.includes("#creative")) return "purple"
        return "default"
    }

    const filteredNotes = notes.filter(n => {
        const term = searchTerm.toLowerCase()
        const matchesSearch = n.title.toLowerCase().includes(term) ||
            (n.content ? n.content.toLowerCase().includes(term) : false)
        const matchesColor = !colorFilter || getNoteColor(n) === colorFilter
        return matchesSearch && matchesColor
    })

    const formatDate = (iso: string) =>
        new Date(iso).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        })

    if (loading) {
        return (
            <div className="notes-page">
                <div className="loading">Loading notes...</div>
            </div>
        )
    }

    return (
        <div className="notes-page">
            <div className="notes-header">
                <h1>My Notes</h1>
                <button
                    className="btn btn-primary"
                    onClick={() => {
                        setIsCreating(true)
                        setError(null)
                    }}
                >
                    <Plus size={18} /> Create New Note
                </button>
            </div>

            {error && (
                <div className="error-message">
                    {error}
                    <button className="error-close" onClick={() => setError(null)}>
                        ×
                    </button>
                </div>
            )}

            <div className="notes-filters">
                <div className="search-container">
                    <Search size={18} className="search-icon" />
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search notes by title or content..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="color-filters">
                    <button 
                        className={`color-filter-btn ${!colorFilter ? 'active' : ''}`}
                        onClick={() => setColorFilter(null)}
                    >
                        All
                    </button>
                    <button 
                        className={`color-filter-btn color-red ${colorFilter === 'red' ? 'active' : ''}`}
                        onClick={() => setColorFilter('red')}
                        title="Red (#red, #urgent, #important)"
                    />
                    <button 
                        className={`color-filter-btn color-blue ${colorFilter === 'blue' ? 'active' : ''}`}
                        onClick={() => setColorFilter('blue')}
                        title="Blue (#blue, #info, #note)"
                    />
                    <button 
                        className={`color-filter-btn color-green ${colorFilter === 'green' ? 'active' : ''}`}
                        onClick={() => setColorFilter('green')}
                        title="Green (#green, #success, #done)"
                    />
                    <button 
                        className={`color-filter-btn color-yellow ${colorFilter === 'yellow' ? 'active' : ''}`}
                        onClick={() => setColorFilter('yellow')}
                        title="Yellow (#yellow, #warning, #todo)"
                    />
                    <button 
                        className={`color-filter-btn color-purple ${colorFilter === 'purple' ? 'active' : ''}`}
                        onClick={() => setColorFilter('purple')}
                        title="Purple (#purple, #idea, #creative)"
                    />
                </div>
            </div>

            {isCreating && (
                <div className="modal-overlay" role="dialog" aria-modal="true">
                    <div className="modal">
                        <div className="modal-header">
                            <h2>Create New Note</h2>
                            <button
                                className="modal-close"
                                onClick={() => {
                                    setIsCreating(false)
                                    setNewNote({ title: "", content: "" })
                                }}
                                aria-label="Close"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form className="note-form" onSubmit={handleCreateNote}>
                            <div className="form-group">
                                <label htmlFor="new-note-title">Title *</label>
                                <input
                                    id="new-note-title"
                                    type="text"
                                    value={newNote.title}
                                    onChange={e => setNewNote(prev => ({ ...prev, title: e.target.value }))}
                                    placeholder="Enter note title"
                                    required
                                    maxLength={255}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="new-note-content">Content *</label>
                                <textarea
                                    id="new-note-content"
                                    rows={6}
                                    value={newNote.content}
                                    onChange={e => setNewNote(prev => ({ ...prev, content: e.target.value }))}
                                    placeholder="Enter note content"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Color Group (Optional)</label>
                                <div className="color-picker">
                                    <button
                                        type="button"
                                        className="color-option color-default"
                                        onClick={() => setNewNote(prev => ({ ...prev, content: prev.content.replace(/#(red|blue|green|yellow|purple|urgent|info|success|warning|idea|important|note|done|todo|creative)/g, '').trim() }))}
                                        title="Default (No color)"
                                    >
                                        Default
                                    </button>
                                    <button
                                        type="button"
                                        className="color-option color-red"
                                        onClick={() => setNewNote(prev => ({ ...prev, content: `${prev.content} #red`.trim() }))}
                                        title="Red (#red, #urgent, #important)"
                                    />
                                    <button
                                        type="button"
                                        className="color-option color-blue"
                                        onClick={() => setNewNote(prev => ({ ...prev, content: `${prev.content} #blue`.trim() }))}
                                        title="Blue (#blue, #info, #note)"
                                    />
                                    <button
                                        type="button"
                                        className="color-option color-green"
                                        onClick={() => setNewNote(prev => ({ ...prev, content: `${prev.content} #green`.trim() }))}
                                        title="Green (#green, #success, #done)"
                                    />
                                    <button
                                        type="button"
                                        className="color-option color-yellow"
                                        onClick={() => setNewNote(prev => ({ ...prev, content: `${prev.content} #yellow`.trim() }))}
                                        title="Yellow (#yellow, #warning, #todo)"
                                    />
                                    <button
                                        type="button"
                                        className="color-option color-purple"
                                        onClick={() => setNewNote(prev => ({ ...prev, content: `${prev.content} #purple`.trim() }))}
                                        title="Purple (#purple, #idea, #creative)"
                                    />
                                </div>
                                <small className="form-hint">Click a color to add a hashtag for color grouping</small>
                            </div>

                            <div className="form-actions">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => {
                                        setIsCreating(false)
                                        setNewNote({ title: "", content: "" })
                                    }}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Create
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {editingNote && (
                <div className="modal-overlay" role="dialog" aria-modal="true">
                    <div className="modal">
                        <div className="modal-header">
                            <h2>Edit Note</h2>
                            <button
                                className="modal-close"
                                onClick={() => {
                                    setEditingNote(null)
                                    setEditForm({ title: "", content: "" })
                                }}
                                aria-label="Close"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form className="note-form" onSubmit={handleEditNote}>
                            <div className="form-group">
                                <label htmlFor="edit-note-title">Title *</label>
                                <input
                                    id="edit-note-title"
                                    type="text"
                                    value={editForm.title}
                                    onChange={e => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                                    required
                                    maxLength={255}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="edit-note-content">Content *</label>
                                <textarea
                                    id="edit-note-content"
                                    rows={6}
                                    value={editForm.content}
                                    onChange={e => setEditForm(prev => ({ ...prev, content: e.target.value }))}
                                    required
                                />
                            </div>

                            <div className="form-actions">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => {
                                        setEditingNote(null)
                                        setEditForm({ title: "", content: "" })
                                    }}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {deleteConfirm !== null && (
                <div className="modal-overlay" role="dialog" aria-modal="true">
                    <div className="modal modal-small">
                        <div className="modal-header">
                            <h2>Delete Note</h2>
                        </div>
                        <div className="modal-body">
                            <p>Are you sure you want to delete this note? This action cannot be undone.</p>
                        </div>
                        <div className="form-actions">
                            <button className="btn btn-secondary" onClick={() => setDeleteConfirm(null)}>
                                Cancel
                            </button>
                            <button className="btn btn-danger" onClick={() => handleDeleteNote(deleteConfirm)}>
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="notes-grid">
                {filteredNotes.length === 0 ? (
                    <div className="no-notes">
                        {searchTerm
                            ? "No notes found matching your search."
                            : "No notes yet. Create your first note!"}
                    </div>
                ) : (
                    filteredNotes.map(note => {
                        const hashtags = extractHashtags(note.content || "")
                        const noteColor = getNoteColor(note)
                        return (
                        <div key={note.id} className={`note-card note-${noteColor}`}>
                            <div className="note-header">
                                <h3 className="note-title" title={note.title}>
                                    {note.title}
                                </h3>
                                <button
                                    className={`btn-icon favorite-btn ${note.favorited ? 'favorited' : ''}`}
                                    onClick={() => handleToggleFavorite(note.id)}
                                    title={note.favorited ? "Remove from favorites" : "Add to favorites"}
                                >
                                    <Star size={18} fill={note.favorited ? "currentColor" : "none"} />
                                </button>
                            </div>

                            {note.content && (
                                <div className="note-content">
                                    <p>{note.content}</p>
                                    {hashtags.length > 0 && (
                                        <div className="note-hashtags">
                                            {hashtags.map((tag, idx) => (
                                                <span key={idx} className="hashtag">{tag}</span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="note-footer">
                                <div className="note-dates">
                                    <small>Created: {formatDate(note.created_at)}</small>
                                    {note.updated_at !== note.created_at && (
                                        <small>Updated: {formatDate(note.updated_at)}</small>
                                    )}
                                </div>
                                <div className="note-actions">
                                    <button className="btn btn-secondary btn-sm" onClick={() => startEdit(note)}>
                                        <Edit2 size={14} /> Edit
                                    </button>
                                    <button className="btn btn-danger btn-sm" onClick={() => setDeleteConfirm(note.id)}>
                                        <Trash2 size={14} /> Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                        )
                    })
                )}
            </div>
        </div>
    )
}

export default NotesPage
