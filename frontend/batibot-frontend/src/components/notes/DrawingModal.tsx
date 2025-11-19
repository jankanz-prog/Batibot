import React, { useState, useCallback } from "react"
import { Excalidraw } from "@excalidraw/excalidraw"
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types/types"
import { X, Save } from "lucide-react"
import type { DrawingData } from "../../types/notes"
import "../../styles/drawingModal.css"

interface DrawingModalProps {
    isOpen: boolean
    onClose: () => void
    initialData?: DrawingData | null
    onSave: (drawingData: DrawingData) => Promise<void>
}

export const DrawingModal: React.FC<DrawingModalProps> = ({
    isOpen,
    onClose,
    initialData,
    onSave
}) => {
    const [excalidrawAPI, setExcalidrawAPI] = useState<ExcalidrawImperativeAPI | null>(null)
    const [saving, setSaving] = useState(false)

    const handleSave = useCallback(async () => {
        if (!excalidrawAPI) return

        try {
            setSaving(true)
            const elements = excalidrawAPI.getSceneElements()
            const appState = excalidrawAPI.getAppState()
            const files = await excalidrawAPI.getFiles()

            const drawingData: DrawingData = {
                elements,
                appState,
                files
            }

            await onSave(drawingData)
            onClose()
        } catch (error) {
            console.error("Error saving drawing:", error)
            alert(error instanceof Error ? error.message : "Failed to save drawing")
        } finally {
            setSaving(false)
        }
    }, [excalidrawAPI, onSave, onClose])

    if (!isOpen) return null

    return (
        <div className="drawing-modal-overlay" onClick={onClose}>
            <div className="drawing-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="drawing-modal-header">
                    <h2>Drawing Canvas</h2>
                    <button
                        type="button"
                        className="drawing-modal-close"
                        onClick={onClose}
                        aria-label="Close"
                    >
                        <X size={20} />
                    </button>
                </div>
                <div className="drawing-modal-body">
                    <Excalidraw
                        ref={(api: ExcalidrawImperativeAPI | null) => setExcalidrawAPI(api)}
                        initialData={initialData || undefined}
                    />
                </div>
                <div className="drawing-modal-footer">
                    <button
                        type="button"
                        className="btn-secondary"
                        onClick={onClose}
                        disabled={saving}
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        className="btn-primary"
                        onClick={handleSave}
                        disabled={saving}
                    >
                        <Save size={16} />
                        {saving ? "Saving..." : "Save Drawing"}
                    </button>
                </div>
            </div>
        </div>
    )
}

