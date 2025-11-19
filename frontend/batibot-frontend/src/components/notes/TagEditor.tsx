import React, { useState, KeyboardEvent } from "react"
import { X } from "lucide-react"
import "../../styles/tagEditor.css"

interface TagEditorProps {
    tags: string[] | null
    onChange: (tags: string[] | null) => void
}

const MAX_TAGS = 10

export const TagEditor: React.FC<TagEditorProps> = ({ tags = [], onChange }) => {
    const [inputValue, setInputValue] = useState("")
    const currentTags = tags || []

    const handleAddTag = () => {
        const trimmed = inputValue.trim()
        if (!trimmed) return

        if (currentTags.length >= MAX_TAGS) {
            alert(`Maximum ${MAX_TAGS} tags allowed`)
            return
        }

        if (currentTags.includes(trimmed)) {
            setInputValue("")
            return
        }

        onChange([...currentTags, trimmed])
        setInputValue("")
    }

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault()
            handleAddTag()
        } else if (e.key === "Backspace" && !inputValue && currentTags.length > 0) {
            onChange(currentTags.slice(0, -1))
        }
    }

    const handleRemoveTag = (tagToRemove: string) => {
        onChange(currentTags.filter(tag => tag !== tagToRemove))
    }

    return (
        <div className="tag-editor">
            <label>
                Tags <span className="tag-count">({currentTags.length}/{MAX_TAGS})</span>
            </label>
            <div className="tag-input-container">
                {currentTags.map((tag, index) => (
                    <span key={index} className="tag-chip">
                        {tag}
                        <button
                            type="button"
                            className="tag-remove"
                            onClick={() => handleRemoveTag(tag)}
                            aria-label={`Remove tag ${tag}`}
                        >
                            <X size={12} />
                        </button>
                    </span>
                ))}
                {currentTags.length < MAX_TAGS && (
                    <input
                        type="text"
                        className="tag-input"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onBlur={handleAddTag}
                        placeholder="Add tag..."
                        maxLength={50}
                    />
                )}
            </div>
            <small className="tag-hint">Press Enter to add, Backspace on empty input to remove last tag</small>
        </div>
    )
}

