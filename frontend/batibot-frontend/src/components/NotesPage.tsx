import type React from "react"
import { useEffect, useState, useCallback, useRef } from "react"
import ReactQuill from "react-quill"
import "react-quill/dist/quill.snow.css"
import { useAuth } from "../context/AuthContext"
import { notesAPI } from "../services/notesAPI"
import type { CreateNoteRequest, Note, UpdateNoteRequest, Attachment } from "../types/notes"
import { Plus, Search, Star, Edit2, Trash2, X, Pin, Archive, Tag as TagIcon, Paperclip, Palette, Calendar, AlertCircle, AlertTriangle, Circle, Image as ImageIcon } from "lucide-react"
import { PrioritySelector } from "./notes/PrioritySelector"
import { ColorPicker } from "./notes/ColorPicker"
import { TagEditor } from "./notes/TagEditor"
import { AttachmentsPanel } from "./notes/AttachmentsPanel"
import { ReminderPicker } from "./notes/ReminderPicker"
import { DrawingModal } from "./notes/DrawingModal"
import "../styles/notes.css"

const AUTO_SAVE_DELAY = 2500 // 2.5 seconds

export const NotesPage: React.FC = () => {
    const { token } = useAuth()

    const [notes, setNotes] = useState<Note[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [savingStatus, setSavingStatus] = useState<{ [key: number]: "saving" | "saved" | null }>({})

    const [searchTerm, setSearchTerm] = useState("")
    const [colorFilter, setColorFilter] = useState<string | null>(null)
    const [priorityFilter, setPriorityFilter] = useState<string | null>(null)
    const [tagFilter, setTagFilter] = useState<string | null>(null)
    const [showArchived, setShowArchived] = useState(false)

    const [isCreating, setIsCreating] = useState(false)
    const [newNote, setNewNote] = useState<CreateNoteRequest>({
        title: "",
        content: "",
        priority: "medium",
        pinned: false,
        archived: false,
        color: null,
        tags: null,
        attachments: null,
        drawings: null,
        reminder: null
    })

    const [editingNote, setEditingNote] = useState<Note | null>(null)
    const [editForm, setEditForm] = useState<UpdateNoteRequest>({ title: "", content: "" })
    const [showDrawingModal, setShowDrawingModal] = useState(false)
    const [drawingNoteId, setDrawingNoteId] = useState<number | null>(null)

    const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)

    const autosaveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    useEffect(() => {
        if (!token) return
        void fetchNotes()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token])

    // Autosave effect for editing note
    useEffect(() => {
        if (!editingNote || !editingNote.id) return

        // Clear existing timeout
        if (autosaveTimeoutRef.current) {
            clearTimeout(autosaveTimeoutRef.current)
        }

        // Set saving status
        setSavingStatus(prev => ({ ...prev, [editingNote.id]: "saving" }))

        // Set new timeout
        autosaveTimeoutRef.current = setTimeout(() => {
            void handleAutosave()
        }, AUTO_SAVE_DELAY)

        return () => {
            if (autosaveTimeoutRef.current) {
                clearTimeout(autosaveTimeoutRef.current)
            }
        }
    }, [editForm, editingNote])

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

    const handleAutosave = async () => {
        if (!token || !editingNote || !editingNote.id) return

        const title = editForm.title.trim()
        const content = editForm.content?.toString().trim() || ""

        if (!title || !content) return

        try {
            const res = await notesAPI.updateNote(editingNote.id, editForm, token)
            if (res.success) {
                setNotes(prev => prev.map(n => (n.id === editingNote.id ? res.data : n)))
                setEditingNote(res.data)
                setSavingStatus(prev => ({ ...prev, [editingNote.id]: "saved" }))
                setTimeout(() => {
                    setSavingStatus(prev => ({ ...prev, [editingNote.id]: null }))
                }, 2000)
            }
        } catch (e) {
            console.error("Autosave error:", e)
            setSavingStatus(prev => ({ ...prev, [editingNote.id]: null }))
        }
    }

    const handleCreateNote = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!token) return

        const title = newNote.title.trim()
        const content = typeof newNote.content === "string" ? newNote.content.trim() : ""

        if (!title || !content) {
            setError("Both title and content are required")
            return
        }

        try {
            setError(null)
            const res = await notesAPI.createNote(newNote, token)
            if (res.success) {
                await fetchNotes() // Re-fetch to get sorted order
                setNewNote({
                    title: "",
                    content: "",
                    priority: "medium",
                    pinned: false,
                    archived: false,
                    color: null,
                    tags: null,
                    attachments: null,
                    drawings: null,
                    reminder: null
                })
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
        setEditForm({
            title: note.title,
            content: note.content ?? "",
            color: note.color,
            priority: note.priority,
            pinned: note.pinned,
            archived: note.archived,
            tags: note.tags,
            attachments: note.attachments,
            drawings: note.drawings,
            reminder: note.reminder
        })
        setError(null)
    }

    const handleEditNote = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!token || !editingNote) return

        try {
            setError(null)
            const res = await notesAPI.updateNote(editingNote.id, editForm, token)
            if (res.success) {
                await fetchNotes()
                setEditingNote(null)
                setEditForm({ title: "", content: "" })
                setSavingStatus({})
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

    const handleTogglePin = async (id: number) => {
        if (!token) return
        try {
            setError(null)
            const res = await notesAPI.togglePin(id, token)
            if (res.success) {
                await fetchNotes()
            } else {
                setError(res.message || "Failed to toggle pin")
            }
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to toggle pin")
        }
    }

    const handleToggleArchive = async (id: number) => {
        if (!token) return
        try {
            setError(null)
            const res = await notesAPI.toggleArchive(id, token)
            if (res.success) {
                await fetchNotes()
            } else {
                setError(res.message || "Failed to toggle archive")
            }
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to toggle archive")
        }
    }

    const handleUpdatePriority = async (id: number, priority: 'low' | 'medium' | 'high') => {
        if (!token) return
        try {
            setError(null)
            const res = await notesAPI.updatePriority(id, priority, token)
            if (res.success) {
                await fetchNotes()
            } else {
                setError(res.message || "Failed to update priority")
            }
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to update priority")
        }
    }

    const handleUpdateColor = async (id: number, color: string | null) => {
        if (!token) return
        try {
            setError(null)
            const res = await notesAPI.updateColor(id, color, token)
            if (res.success) {
                await fetchNotes()
            } else {
                setError(res.message || "Failed to update color")
            }
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to update color")
        }
    }

    const handleUpdateTags = async (id: number, tags: string[] | null) => {
        if (!token) return
        try {
            setError(null)
            const res = await notesAPI.updateTags(id, tags, token)
            if (res.success) {
                await fetchNotes()
            } else {
                setError(res.message || "Failed to update tags")
            }
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to update tags")
        }
    }

    const handleSetReminder = async (id: number, reminder: string | null) => {
        if (!token) return
        try {
            setError(null)
            const res = await notesAPI.setReminder(id, reminder, token)
            if (res.success) {
                await fetchNotes()
            } else {
                setError(res.message || "Failed to set reminder")
            }
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to set reminder")
        }
    }

    const handleUploadAttachments = async (id: number, files: File[]) => {
        if (!token) return
        try {
            setError(null)
            const res = await notesAPI.uploadAttachments(id, files, token)
            if (res.success) {
                await fetchNotes()
            } else {
                setError(res.message || "Failed to upload attachments")
            }
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to upload attachments")
        }
    }

    const handleDeleteAttachment = async (noteId: number, attachmentIndex: number) => {
        if (!editingNote || editingNote.id !== noteId) return
        
        const currentAttachments = editingNote.attachments || []
        const updatedAttachments = currentAttachments.filter((_, idx) => idx !== attachmentIndex)
        
        setEditForm(prev => ({ ...prev, attachments: updatedAttachments.length > 0 ? updatedAttachments : null }))
        await handleEditNote({ preventDefault: () => {} } as React.FormEvent)
    }

    const handleSaveDrawing = async (drawingData: any) => {
        if (!token || !drawingNoteId) return
        try {
            setError(null)
            const res = await notesAPI.updateDrawings(drawingNoteId, drawingData, token)
            if (res.success) {
                await fetchNotes()
                setShowDrawingModal(false)
                setDrawingNoteId(null)
            } else {
                setError(res.message || "Failed to save drawing")
            }
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to save drawing")
        }
    }

    const getNoteColor = (note: Note): string => {
        if (note.color) return note.color
        // Fallback to old hashtag method
        const content = note.content || ""
        if (content.includes("#red") || content.includes("#urgent") || content.includes("#important")) return "red"
        if (content.includes("#blue") || content.includes("#info") || content.includes("#note")) return "blue"
        if (content.includes("#green") || content.includes("#success") || content.includes("#done")) return "green"
        if (content.includes("#yellow") || content.includes("#warning") || content.includes("#todo")) return "yellow"
        if (content.includes("#purple") || content.includes("#idea") || content.includes("#creative")) return "purple"
        return "default"
    }

    const filteredNotes = notes.filter(n => {
        // Don't show archived notes unless filter is enabled
        if (!showArchived && n.archived) return false

        const term = searchTerm.toLowerCase()
        const matchesSearch = n.title.toLowerCase().includes(term) ||
            (n.content ? n.content.toString().toLowerCase().includes(term) : false)
        
        const matchesColor = !colorFilter || (n.color === colorFilter || (!n.color && colorFilter === "default"))
        const matchesPriority = !priorityFilter || n.priority === priorityFilter
        const matchesTag = !tagFilter || (n.tags && n.tags.includes(tagFilter))

        return matchesSearch && matchesColor && matchesPriority && matchesTag
    })

    // Notes are already sorted by backend (pinned → priority → date)
    const sortedNotes = filteredNotes

    const formatDate = (iso: string) =>
        new Date(iso).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        })

    const getPriorityIcon = (priority: 'low' | 'medium' | 'high') => {
        switch (priority) {
            case 'high':
                return <AlertCircle size={14} className="priority-icon priority-high" />
            case 'medium':
                return <AlertTriangle size={14} className="priority-icon priority-medium" />
            case 'low':
                return <Circle size={14} className="priority-icon priority-low" />
        }
    }

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
                <div className="filter-buttons">
                    <button
                        className={`filter-btn ${showArchived ? 'active' : ''}`}
                        onClick={() => setShowArchived(!showArchived)}
                    >
                        <Archive size={14} />
                        {showArchived ? "Hide Archived" : "Show Archived"}
                    </button>
                    <select
                        className="filter-select"
                        value={priorityFilter || ""}
                        onChange={(e) => setPriorityFilter(e.target.value || null)}
                    >
                        <option value="">All Priorities</option>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                    </select>
                </div>
            </div>

            {/* Create Note Modal */}
            {isCreating && (
                <div className="modal-overlay" role="dialog" aria-modal="true" onClick={() => setIsCreating(false)}>
                    <div className="modal modal-large" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Create New Note</h2>
                            <button
                                className="modal-close"
                                onClick={() => {
                                    setIsCreating(false)
                                    setNewNote({
                                        title: "",
                                        content: "",
                                        priority: "medium",
                                        pinned: false,
                                        archived: false,
                                        color: null,
                                        tags: null,
                                        attachments: null,
                                        drawings: null,
                                        reminder: null
                                    })
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
                                <ReactQuill
                                    theme="snow"
                                    value={typeof newNote.content === "string" ? newNote.content : ""}
                                    onChange={(value) => setNewNote(prev => ({ ...prev, content: value }))}
                                    placeholder="Enter note content"
                                />
                            </div>

                            <div className="form-row">
                                <PrioritySelector
                                    value={newNote.priority || "medium"}
                                    onChange={(priority) => setNewNote(prev => ({ ...prev, priority }))}
                                />
                                <ColorPicker
                                    value={newNote.color}
                                    onChange={(color) => setNewNote(prev => ({ ...prev, color }))}
                                />
                            </div>

                            <TagEditor
                                tags={newNote.tags}
                                onChange={(tags) => setNewNote(prev => ({ ...prev, tags }))}
                            />

                            <ReminderPicker
                                value={newNote.reminder || null}
                                onChange={(reminder) => setNewNote(prev => ({ ...prev, reminder }))}
                            />

                            <div className="form-actions">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => {
                                        setIsCreating(false)
                                        setNewNote({
                                            title: "",
                                            content: "",
                                            priority: "medium",
                                            pinned: false,
                                            archived: false,
                                            color: null,
                                            tags: null,
                                            attachments: null,
                                            drawings: null,
                                            reminder: null
                                        })
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

            {/* Edit Note Modal */}
            {editingNote && (
                <div className="modal-overlay" role="dialog" aria-modal="true" onClick={() => setEditingNote(null)}>
                    <div className="modal modal-large" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Edit Note {savingStatus[editingNote.id] === "saving" && <span className="saving-indicator">Saving...</span>}
                                {savingStatus[editingNote.id] === "saved" && <span className="saved-indicator">Saved</span>}
                            </h2>
                            <button
                                className="modal-close"
                                onClick={() => {
                                    setEditingNote(null)
                                    setEditForm({ title: "", content: "" })
                                    setSavingStatus({})
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
                                <ReactQuill
                                    theme="snow"
                                    value={typeof editForm.content === "string" ? editForm.content : ""}
                                    onChange={(value) => setEditForm(prev => ({ ...prev, content: value }))}
                                    placeholder="Enter note content"
                                />
                            </div>

                            <div className="form-row">
                                <PrioritySelector
                                    value={editForm.priority || "medium"}
                                    onChange={(priority) => {
                                        setEditForm(prev => ({ ...prev, priority }))
                                        void handleUpdatePriority(editingNote.id, priority)
                                    }}
                                />
                                <ColorPicker
                                    value={editForm.color || null}
                                    onChange={(color) => {
                                        setEditForm(prev => ({ ...prev, color }))
                                        void handleUpdateColor(editingNote.id, color)
                                    }}
                                />
                            </div>

                            <TagEditor
                                tags={editForm.tags || null}
                                onChange={(tags) => {
                                    setEditForm(prev => ({ ...prev, tags }))
                                    void handleUpdateTags(editingNote.id, tags)
                                }}
                            />

                            <ReminderPicker
                                value={editForm.reminder || null}
                                onChange={(reminder) => {
                                    setEditForm(prev => ({ ...prev, reminder }))
                                    void handleSetReminder(editingNote.id, reminder)
                                }}
                            />

                            <AttachmentsPanel
                                attachments={editForm.attachments || null}
                                onUpload={(files) => handleUploadAttachments(editingNote.id, files)}
                                onDelete={(index) => handleDeleteAttachment(editingNote.id, index)}
                            />

                            <div className="form-group">
                                <label>Drawing</label>
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => {
                                        setDrawingNoteId(editingNote.id)
                                        setShowDrawingModal(true)
                                    }}
                                >
                                    <ImageIcon size={16} /> {editingNote.drawings ? "Edit Drawing" : "Add Drawing"}
                                </button>
                            </div>

                            <div className="form-actions">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => {
                                        setEditingNote(null)
                                        setEditForm({ title: "", content: "" })
                                        setSavingStatus({})
                                    }}
                                >
                                    Close
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Drawing Modal */}
            {showDrawingModal && drawingNoteId && (
                <DrawingModal
                    isOpen={showDrawingModal}
                    onClose={() => {
                        setShowDrawingModal(false)
                        setDrawingNoteId(null)
                    }}
                    initialData={editingNote?.drawings || null}
                    onSave={handleSaveDrawing}
                />
            )}

            {/* Delete Confirmation Modal */}
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
                {sortedNotes.length === 0 ? (
                    <div className="no-notes">
                        {searchTerm
                            ? "No notes found matching your search."
                            : "No notes yet. Create your first note!"}
                    </div>
                ) : (
                    sortedNotes.map(note => {
                        const noteColor = getNoteColor(note)
                        const backgroundColor = note.color || undefined
                        return (
                            <div
                                key={note.id}
                                className={`note-card ${note.pinned ? "pinned" : ""} ${note.archived ? "archived" : ""}`}
                                style={backgroundColor ? { borderLeft: `4px solid ${backgroundColor}`, backgroundColor: backgroundColor === "#ffffff" ? undefined : `${backgroundColor}20` } : undefined}
                            >
                                <div className="note-header">
                                    <div className="note-title-row">
                                        {note.pinned && <Pin size={16} className="pin-icon" />}
                                        <h3 className="note-title" title={note.title}>
                                            {note.title}
                                        </h3>
                                        {getPriorityIcon(note.priority)}
                                    </div>
                                    <div className="note-header-actions">
                                        <button
                                            className={`btn-icon ${note.pinned ? 'active' : ''}`}
                                            onClick={() => handleTogglePin(note.id)}
                                            title={note.pinned ? "Unpin" : "Pin"}
                                        >
                                            <Pin size={16} />
                                        </button>
                                        <button
                                            className={`btn-icon favorite-btn ${note.favorited ? 'favorited' : ''}`}
                                            onClick={() => handleToggleFavorite(note.id)}
                                            title={note.favorited ? "Remove from favorites" : "Add to favorites"}
                                        >
                                            <Star size={16} fill={note.favorited ? "currentColor" : "none"} />
                                        </button>
                                    </div>
                                </div>

                                <div className="note-content" dangerouslySetInnerHTML={{ __html: note.content || "" }} />

                                {note.tags && note.tags.length > 0 && (
                                    <div className="note-tags">
                                        {note.tags.map((tag, idx) => (
                                            <span
                                                key={idx}
                                                className="tag-chip"
                                                onClick={() => setTagFilter(tag)}
                                                title="Click to filter by this tag"
                                            >
                                                <TagIcon size={12} />
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {note.attachments && note.attachments.length > 0 && (
                                    <div className="note-attachments">
                                        <Paperclip size={14} />
                                        <span>{note.attachments.length} attachment{note.attachments.length > 1 ? "s" : ""}</span>
                                    </div>
                                )}

                                {note.drawings && (
                                    <div className="note-drawing-indicator">
                                        <ImageIcon size={14} />
                                        <span>Has drawing</span>
                                    </div>
                                )}

                                {note.reminder && (
                                    <div className="note-reminder">
                                        <Calendar size={14} />
                                        <span>{formatDate(note.reminder)}</span>
                                    </div>
                                )}

                                <div className="note-footer">
                                    <div className="note-dates">
                                        <small>Updated: {formatDate(note.updated_at)}</small>
                                    </div>
                                    <div className="note-actions">
                                        <button
                                            className={`btn-icon ${note.archived ? 'active' : ''}`}
                                            onClick={() => handleToggleArchive(note.id)}
                                            title={note.archived ? "Unarchive" : "Archive"}
                                        >
                                            <Archive size={14} />
                                        </button>
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
