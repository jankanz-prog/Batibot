import React from "react"
import { Circle, AlertTriangle, AlertCircle } from "lucide-react"
import "../../styles/prioritySelector.css"

interface PrioritySelectorProps {
    value: 'low' | 'medium' | 'high'
    onChange: (priority: 'low' | 'medium' | 'high') => void
}

const priorities = [
    { value: 'low' as const, label: 'Low', icon: Circle, color: '#10b981', bg: '#d1fae5' },
    { value: 'medium' as const, label: 'Medium', icon: AlertTriangle, color: '#f59e0b', bg: '#fef3c7' },
    { value: 'high' as const, label: 'High', icon: AlertCircle, color: '#ef4444', bg: '#fee2e2' }
]

export const PrioritySelector: React.FC<PrioritySelectorProps> = ({ value, onChange }) => {
    return (
        <div className="priority-selector">
            <label>Priority</label>
            <div className="priority-buttons">
                {priorities.map(({ value: pValue, label, icon: Icon, color, bg }) => (
                    <button
                        key={pValue}
                        type="button"
                        className={`priority-btn priority-${pValue} ${value === pValue ? 'active' : ''}`}
                        onClick={() => onChange(pValue)}
                        style={{
                            backgroundColor: value === pValue ? bg : undefined,
                            borderColor: value === pValue ? color : undefined,
                            color: value === pValue ? color : undefined,
                            fontWeight: value === pValue ? 600 : 500,
                            transform: value === pValue ? "scale(1.02)" : "scale(1)"
                        }}
                    >
                        <Icon size={16} />
                        {label}
                    </button>
                ))}
            </div>
        </div>
    )
}
