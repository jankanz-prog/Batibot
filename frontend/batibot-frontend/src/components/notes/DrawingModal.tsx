import React, { useState, useRef, useEffect } from "react"
import { X, Save, Trash2, Pencil, Eraser } from "lucide-react"
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
    const [isSaving, setIsSaving] = useState(false)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [isDrawing, setIsDrawing] = useState(false)
    const [color, setColor] = useState("#000000")
    const [lineWidth, setLineWidth] = useState(3)
    const [tool, setTool] = useState<'pen' | 'eraser'>('pen')
    const lastPosRef = useRef({ x: 0, y: 0 })

    const colors = ['#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500']

    // Initialize canvas
    const initializeCanvas = () => {
        const canvas = canvasRef.current
        if (!canvas) return
        
        const ctx = canvas.getContext('2d', { willReadFrequently: true })
        if (ctx) {
            // Reset composite operation
            ctx.globalCompositeOperation = 'source-over'
            ctx.lineCap = 'round'
            ctx.lineJoin = 'round'
            
            // Fill with white background
            ctx.fillStyle = '#ffffff'
            ctx.fillRect(0, 0, canvas.width, canvas.height)
            
            // Load existing drawing if available
            if (initialData?.files?.dataURL) {
                const img = new Image()
                img.onload = () => {
                    const context = canvas.getContext('2d')
                    if (context && canvas) {
                        context.globalCompositeOperation = 'source-over'
                        context.drawImage(img, 0, 0, canvas.width, canvas.height)
                    }
                }
                img.onerror = (e) => {
                    console.error('Failed to load image:', e)
                }
                img.src = initialData.files.dataURL
            }
        }
    }

    useEffect(() => {
        if (isOpen && canvasRef.current) {
            // Small delay to ensure DOM is ready
            setTimeout(() => {
                initializeCanvas()
            }, 0)
        }
    }, [isOpen])

    // Separate effect for initialData changes
    useEffect(() => {
        if (isOpen && initialData && canvasRef.current) {
            initializeCanvas()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialData])

    const getCanvasCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current
        if (!canvas) return { x: 0, y: 0 }
        
        const rect = canvas.getBoundingClientRect()
        const scaleX = canvas.width / rect.width
        const scaleY = canvas.height / rect.height
        
        const clientX = 'touches' in e ? e.touches[0]?.clientX || 0 : e.clientX
        const clientY = 'touches' in e ? e.touches[0]?.clientY || 0 : e.clientY
        
        return {
            x: (clientX - rect.left) * scaleX,
            y: (clientY - rect.top) * scaleY
        }
    }

    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        e.preventDefault()
        const canvas = canvasRef.current
        if (!canvas) return
        
        const coords = getCanvasCoordinates(e)
        lastPosRef.current = coords
        
        const ctx = canvas.getContext('2d')
        if (ctx) {
            // Set composite operation and styles
            ctx.globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over'
            ctx.strokeStyle = tool === 'eraser' ? 'rgba(0,0,0,1)' : color
            ctx.lineWidth = tool === 'eraser' ? lineWidth * 3 : lineWidth
            ctx.lineCap = 'round'
            ctx.lineJoin = 'round'
            
            ctx.beginPath()
            ctx.moveTo(coords.x, coords.y)
            setIsDrawing(true)
        }
    }

    const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        e.preventDefault()
        if (!isDrawing) return
        
        const canvas = canvasRef.current
        if (!canvas) return
        
        const coords = getCanvasCoordinates(e)
        const ctx = canvas.getContext('2d')
        
        if (ctx) {
            ctx.lineTo(coords.x, coords.y)
            ctx.stroke()
            ctx.beginPath()
            ctx.moveTo(coords.x, coords.y)
            
            lastPosRef.current = coords
        }
    }

    const stopDrawing = (e?: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        if (e) e.preventDefault()
        if (!isDrawing) return
        
        const canvas = canvasRef.current
        if (!canvas) return
        
        const ctx = canvas.getContext('2d')
        if (ctx) {
            ctx.closePath()
        }
        setIsDrawing(false)
    }

    const clearCanvas = () => {
        const canvas = canvasRef.current
        if (!canvas) return
        
        const ctx = canvas.getContext('2d')
        if (ctx) {
            // Save the current state
            ctx.save()
            
            // Reset composite operation before clearing
            ctx.globalCompositeOperation = 'source-over'
            
            // Clear and fill with white
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            ctx.fillStyle = '#ffffff'
            ctx.fillRect(0, 0, canvas.width, canvas.height)
            
            // Restore the state
            ctx.restore()
            
            // Ensure we're back to normal drawing mode
            ctx.globalCompositeOperation = 'source-over'
        }
    }

    const handleSave = async () => {
        setIsSaving(true)
        try {
            const canvas = canvasRef.current
            if (canvas) {
                const dataURL = canvas.toDataURL('image/png')
                const drawingData: DrawingData = {
                    elements: [],
                    appState: {},
                    files: { dataURL }
                }
                await onSave(drawingData)
                onClose()
            }
        } catch (error) {
            console.error('Failed to save drawing', error)
            alert(error instanceof Error ? error.message : "Failed to save drawing")
        } finally {
            setIsSaving(false)
        }
    }

    const handleClose = () => {
        if (isSaving) return
        onClose()
    }

    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            handleClose()
        }
    }

    // Handle touch events
    const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
        startDrawing(e)
    }

    const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
        draw(e)
    }

    const handleTouchEnd = (e: React.TouchEvent<HTMLCanvasElement>) => {
        stopDrawing(e)
    }

    if (!isOpen) return null

    return (
        <div 
            className="drawing-modal-overlay"
            onClick={handleOverlayClick}
        >
            <div 
                className="drawing-modal-content"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="drawing-modal-header">
                    <h2>Drawing Canvas</h2>
                    <button
                        onClick={handleClose}
                        disabled={isSaving}
                        className="drawing-modal-close"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Toolbar */}
                <div className="drawing-modal-toolbar">
                    <div className="toolbar-section">
                        {/* Tools */}
                        <div className="toolbar-group">
                            <span className="toolbar-label">Tool:</span>
                            <button
                                onClick={() => setTool('pen')}
                                className={`tool-btn tool-pen ${tool === 'pen' ? 'tool-btn-active' : ''}`}
                            >
                                <Pencil size={16} />
                                Pen
                            </button>
                            <button
                                onClick={() => setTool('eraser')}
                                className={`tool-btn tool-eraser ${tool === 'eraser' ? 'tool-btn-active' : ''}`}
                            >
                                <Eraser size={16} />
                                Eraser
                            </button>
                        </div>

                        {/* Color Picker */}
                        <div className="toolbar-group">
                            <span className="toolbar-label">Color:</span>
                            <div className="color-presets">
                                {colors.map(c => (
                                    <button
                                        key={c}
                                        onClick={() => {
                                            setColor(c)
                                            setTool('pen')
                                        }}
                                        disabled={tool === 'eraser'}
                                        className={`color-preset-btn ${color === c && tool === 'pen' ? 'color-preset-active' : ''} ${tool === 'eraser' ? 'color-preset-disabled' : ''}`}
                                        style={{ backgroundColor: c }}
                                        title={c}
                                    />
                                ))}
                                <input
                                    type="color"
                                    value={color}
                                    onChange={(e) => {
                                        setColor(e.target.value)
                                        setTool('pen')
                                    }}
                                    disabled={tool === 'eraser'}
                                    className="color-input-custom"
                                />
                            </div>
                        </div>

                        {/* Size Slider */}
                        <div className="toolbar-group">
                            <span className="toolbar-label">Size:</span>
                            <input
                                type="range"
                                min="1"
                                max="20"
                                value={lineWidth}
                                onChange={(e) => setLineWidth(Number(e.target.value))}
                                className="size-slider"
                            />
                            <span className="size-value">{lineWidth}px</span>
                        </div>

                        {/* Clear Button */}
                        <button
                            onClick={clearCanvas}
                            className="clear-btn"
                        >
                            <Trash2 size={16} />
                            Clear
                        </button>
                    </div>
                </div>

                {/* Canvas */}
                <div className="drawing-modal-canvas-container">
                    <div className="canvas-wrapper">
                        <canvas
                            ref={canvasRef}
                            width={800}
                            height={500}
                            onMouseDown={startDrawing}
                            onMouseMove={draw}
                            onMouseUp={stopDrawing}
                            onMouseLeave={stopDrawing}
                            onTouchStart={handleTouchStart}
                            onTouchMove={handleTouchMove}
                            onTouchEnd={handleTouchEnd}
                            className={`drawing-canvas ${tool === 'pen' ? 'drawing-canvas-pen' : 'drawing-canvas-eraser'}`}
                            style={{ touchAction: 'none' }}
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="drawing-modal-footer">
                    <button
                        onClick={handleClose}
                        disabled={isSaving}
                        className="btn-secondary"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="btn-primary"
                    >
                        <Save size={16} />
                        {isSaving ? "Saving..." : "Save Drawing"}
                    </button>
                </div>
            </div>
        </div>
    )
}
