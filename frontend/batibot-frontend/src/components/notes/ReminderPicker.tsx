import React, { useState } from "react"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { Calendar, X } from "lucide-react"
import "../../styles/reminderPicker.css"

interface ReminderPickerProps {
    value: string | null
    onChange: (reminder: string | null) => void
}

export const ReminderPicker: React.FC<ReminderPickerProps> = ({ value, onChange }) => {
    const [showPicker, setShowPicker] = useState(false)
    const selectedDate = value ? new Date(value) : null

    const handleDateChange = (date: Date | null) => {
        if (date) {
            onChange(date.toISOString())
        } else {
            onChange(null)
        }
    }

    return (
        <div className="reminder-picker">
            <label>Reminder</label>
            <div className="reminder-picker-container">
                {selectedDate ? (
                    <div className="reminder-display">
                        <Calendar size={16} />
                        <span>{selectedDate.toLocaleString()}</span>
                        <button
                            type="button"
                            className="reminder-clear"
                            onClick={() => onChange(null)}
                            title="Clear reminder"
                        >
                            <X size={14} />
                        </button>
                    </div>
                ) : (
                    <button
                        type="button"
                        className="reminder-set-btn"
                        onClick={() => setShowPicker(true)}
                    >
                        <Calendar size={16} />
                        Set Reminder
                    </button>
                )}
                {showPicker && (
                    <div className="date-picker-popup">
                        <DatePicker
                            selected={selectedDate}
                            onChange={(date) => {
                                handleDateChange(date)
                                if (date) setShowPicker(false)
                            }}
                            showTimeSelect
                            dateFormat="MMMM d, yyyy h:mm aa"
                            minDate={new Date()}
                            inline
                            popperPlacement="bottom-start"
                        />
                        <div className="date-picker-actions">
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

