import React, { useState } from "react"
import type { KeyboardEvent } from "react"
import { X } from "lucide-react"
import "../../styles/tagEditor.css"

interface TagEditorProps {
    tags: string[] | null
    onChange: (tags: string[] | null) => void
}

const MAX_TAGS = 10

export const TagEditor: React.FC<TagEditorProps> = ({ tags = [], onChange }) => {
    const [inputValue, setInputValue] = useState("")
    const [isInputFocused, setIsInputFocused] = useState(false)
    const currentTags = tags || []

    const handleAddTag = () => {
        const trimmed = inputValue.trim()
        if (!trimmed) return

        if (currentTags.length >= MAX_TAGS) {
            return
        }

        if (!currentTags.includes(trimmed)) {
            onChange([...currentTags, trimmed])
        }
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

    return (
        <div className="tag-editor">
            <label>
                <span>Tags</span>
                <span className={`tag-count ${currentTags.length >= MAX_TAGS ? 'tag-count-max' : ''}`}>
                    {currentTags.length}/{MAX_TAGS}
                </span>
            </label>
            <div className={`tag-input-container ${isInputFocused ? 'tag-input-focused' : ''}`}>
                {currentTags.map((tag, index) => (
                    <span key={index} className="tag-chip">
                        {tag}
                        <button
                            type="button"
                            className="tag-remove"
                            onClick={() => onChange(currentTags.filter(t => t !== tag))}
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
                        onFocus={() => setIsInputFocused(true)}
                        onBlur={() => {
                            setIsInputFocused(false)
                            handleAddTag()
                        }}
                        placeholder={currentTags.length === 0 ? "Type and press Enter..." : ""}
                        maxLength={50}
                    />
                )}
            </div>
            <small className="tag-hint">Press Enter to add • Backspace on empty to remove last</small>
        </div>
    )
}
