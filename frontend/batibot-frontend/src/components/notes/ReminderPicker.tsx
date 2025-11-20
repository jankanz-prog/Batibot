import React, { useState, useRef, useEffect } from "react"
import { Calendar, X, Clock } from "lucide-react"
import "../../styles/reminderPicker.css"

interface ReminderPickerProps {
    value: string | null
    onChange: (reminder: string | null) => void
}

export const ReminderPicker: React.FC<ReminderPickerProps> = ({ value, onChange }) => {
    const [showPicker, setShowPicker] = useState(false)
    const [selectedDate, setSelectedDate] = useState(value ? new Date(value) : new Date())
    const pickerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (value) {
            setSelectedDate(new Date(value))
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

    const formatDate = (date: Date) => {
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        })
    }

    const handleSave = () => {
        onChange(selectedDate.toISOString())
        setShowPicker(false)
    }

    return (
        <div className="reminder-picker">
            <label>Reminder</label>
            <div className="reminder-picker-container">
                {value ? (
                    <div className="reminder-display">
                        <Calendar size={18} className="reminder-icon" />
                        <span>{formatDate(new Date(value))}</span>
                        <button
                            type="button"
                            className="reminder-clear"
                            onClick={() => onChange(null)}
                            title="Clear reminder"
                        >
                            <X size={16} />
                        </button>
                    </div>
                ) : (
                    <button
                        type="button"
                        className="reminder-set-btn"
                        onClick={() => setShowPicker(true)}
                    >
                        <Calendar size={18} />
                        <span>Set Reminder</span>
                    </button>
                )}

                {showPicker && (
                    <div ref={pickerRef} className="date-picker-popup">
                        <div className="date-picker-content">
                            <div className="date-picker-field">
                                <label htmlFor="reminder-date" className="date-picker-label">
                                    <Calendar size={16} className="label-icon" />
                                    Date
                                </label>
                                <input
                                    id="reminder-date"
                                    type="date"
                                    value={selectedDate.toISOString().split('T')[0]}
                                    onChange={(e) => {
                                        const newDate = new Date(selectedDate)
                                        const [year, month, day] = e.target.value.split('-').map(Number)
                                        newDate.setFullYear(year, month - 1, day)
                                        setSelectedDate(newDate)
                                    }}
                                    className="date-input"
                                    min={new Date().toISOString().split('T')[0]}
                                />
                            </div>

                            <div className="date-picker-field">
                                <label htmlFor="reminder-time" className="date-picker-label">
                                    <Clock size={16} className="label-icon" />
                                    Time
                                </label>
                                <input
                                    id="reminder-time"
                                    type="time"
                                    value={selectedDate.toTimeString().slice(0, 5)}
                                    onChange={(e) => {
                                        const [hours, minutes] = e.target.value.split(':').map(Number)
                                        const newDate = new Date(selectedDate)
                                        newDate.setHours(hours, minutes)
                                        setSelectedDate(newDate)
                                    }}
                                    className="date-input"
                                />
                            </div>

                            <div className="date-picker-actions">
                                <button
                                    type="button"
                                    className="btn-cancel"
                                    onClick={() => setShowPicker(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="btn-save"
                                    onClick={handleSave}
                                >
                                    Set Reminder
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
