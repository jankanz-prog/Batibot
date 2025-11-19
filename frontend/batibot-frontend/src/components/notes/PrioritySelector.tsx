import React from "react"
import { Circle, AlertTriangle, AlertCircle } from "lucide-react"
import "../../styles/prioritySelector.css"

interface PrioritySelectorProps {
    value: 'low' | 'medium' | 'high'
    onChange: (priority: 'low' | 'medium' | 'high') => void
}

export const PrioritySelector: React.FC<PrioritySelectorProps> = ({ value, onChange }) => {
    return (
        <div className="priority-selector">
            <label>Priority</label>
            <div className="priority-buttons">
                <button
                    type="button"
                    className={`priority-btn priority-low ${value === 'low' ? 'active' : ''}`}
                    onClick={() => onChange('low')}
                    title="Low Priority"
                >
                    <Circle size={16} />
                    Low
                </button>
                <button
                    type="button"
                    className={`priority-btn priority-medium ${value === 'medium' ? 'active' : ''}`}
                    onClick={() => onChange('medium')}
                    title="Medium Priority"
                >
                    <AlertTriangle size={16} />
                    Medium
                </button>
                <button
                    type="button"
                    className={`priority-btn priority-high ${value === 'high' ? 'active' : ''}`}
                    onClick={() => onChange('high')}
                    title="High Priority"
                >
                    <AlertCircle size={16} />
                    High
                </button>
            </div>
        </div>
    )
}

