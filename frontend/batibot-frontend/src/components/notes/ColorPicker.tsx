import React, { useState, useRef, useEffect } from "react"
import { X } from "lucide-react"
import "../../styles/colorPicker.css"

interface ColorPickerProps {
    value: string | null
    onChange: (color: string | null) => void
}

const PRESET_COLORS = [
    "#ffffff", "#f3f4f6", "#fef3c7", "#fde68a",
    "#fed7aa", "#fecaca", "#fbcfe8", "#e9d5ff",
    "#ddd6fe", "#c7d2fe", "#bfdbfe", "#a5f3fc",
    "#a7f3d0", "#d1fae5", "#f0fdf4"
]

export const ColorPicker: React.FC<ColorPickerProps> = ({ value, onChange }) => {
    const [showPicker, setShowPicker] = useState(false)
    const [customColor, setCustomColor] = useState(value || "#ffffff")
    const pickerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (value && !PRESET_COLORS.includes(value)) {
            setCustomColor(value)
        }
    }, [value])

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
                setShowPicker(false)
            }
        }

        if (showPicker) {
            document.addEventListener("mousedown", handleClickOutside)
            return () => document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [showPicker])

    return (
        <div className="color-picker-wrapper">
            <label>Color Label</label>
            <div className="color-picker-container">
                <div className="preset-colors">
                    {PRESET_COLORS.map((color) => (
                        <button
                            key={color}
                            type="button"
                            className={`color-preset ${value === color ? 'active' : ''}`}
                            style={{ backgroundColor: color }}
                            onClick={() => onChange(color)}
                            title={color}
                        />
                    ))}
                </div>
                
                <div className="custom-color-controls">
                    <button
                        type="button"
                        className="custom-color-btn"
                        onClick={() => setShowPicker(!showPicker)}
                        style={{
                            backgroundColor: value && !PRESET_COLORS.includes(value) ? value : undefined,
                            color: value && !PRESET_COLORS.includes(value) ? "#fff" : undefined,
                            textShadow: value && !PRESET_COLORS.includes(value) ? "0 1px 2px rgba(0,0,0,0.2)" : "none"
                        }}
                    >
                        {value && !PRESET_COLORS.includes(value) ? `Custom: ${value}` : "Custom Color"}
                    </button>
                    
                    {value && (
                        <button
                            type="button"
                            className="color-clear-btn"
                            onClick={() => onChange(null)}
                            title="Clear color"
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>

                {showPicker && (
                    <div ref={pickerRef} className="color-picker-popup">
                        <input
                            type="color"
                            value={customColor}
                            onChange={(e) => {
                                setCustomColor(e.target.value)
                                onChange(e.target.value)
                            }}
                            className="color-input-visual"
                        />
                        <input
                            type="text"
                            value={customColor}
                            onChange={(e) => {
                                setCustomColor(e.target.value)
                                if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
                                    onChange(e.target.value)
                                }
                            }}
                            className="color-input-text"
                            placeholder="#000000"
                        />
                        <button
                            type="button"
                            className="color-picker-done"
                            onClick={() => setShowPicker(false)}
                        >
                            Done
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
