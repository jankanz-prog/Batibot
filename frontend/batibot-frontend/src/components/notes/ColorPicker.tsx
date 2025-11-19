import React, { useState } from "react"
import { HexColorPicker } from "react-colorful"
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
                    <button
                        type="button"
                        className="color-preset color-clear"
                        onClick={() => onChange(null)}
                        title="Clear Color"
                    >
                        <X size={14} />
                    </button>
                </div>
                <button
                    type="button"
                    className="custom-color-btn"
                    onClick={() => setShowPicker(!showPicker)}
                >
                    {value ? (
                        <div
                            className="selected-color"
                            style={{ backgroundColor: value }}
                        />
                    ) : (
                        "Custom Color"
                    )}
                </button>
                {showPicker && (
                    <div className="color-picker-popup">
                        <HexColorPicker
                            color={value || "#ffffff"}
                            onChange={onChange}
                        />
                        <div className="color-picker-actions">
                            <button
                                type="button"
                                onClick={() => {
                                    onChange(null)
                                    setShowPicker(false)
                                }}
                                className="btn-clear"
                            >
                                Clear
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowPicker(false)}
                                className="btn-close"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

