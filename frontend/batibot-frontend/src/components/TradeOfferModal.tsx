"use client"

import type React from "react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"

interface InventoryItem {
    id: string
    name: string
    rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
    image?: string
    quantity: number
    value: number
}

interface TradeOfferModalProps {
    isOpen: boolean
    onClose: () => void
    targetUser: string
    targetItem: string
    targetItemValue: number
}

// Mock inventory data
const mockInventory: InventoryItem[] = [
    { id: '1', name: 'Ancient Sword', rarity: 'legendary', quantity: 1, value: 25.00 },
    { id: '2', name: 'Magic Shield', rarity: 'epic', quantity: 2, value: 15.50 },
    { id: '3', name: 'Steel Helmet', rarity: 'rare', quantity: 1, value: 8.00 },
    { id: '4', name: 'Iron Boots', rarity: 'uncommon', quantity: 3, value: 4.25 },
    { id: '5', name: 'Wooden Staff', rarity: 'common', quantity: 5, value: 2.10 },
    { id: '6', name: 'Crystal Orb', rarity: 'epic', quantity: 1, value: 18.25 },
    { id: '7', name: 'Silver Ring', rarity: 'rare', quantity: 2, value: 12.00 },
    { id: '8', name: 'Basic Potion', rarity: 'common', quantity: 10, value: 1.50 }
]

export const TradeOfferModal: React.FC<TradeOfferModalProps> = ({
    isOpen,
    onClose,
    targetUser,
    targetItem,
    targetItemValue
}) => {
    const navigate = useNavigate()
    const [selectedItems, setSelectedItems] = useState<InventoryItem[]>([])
    const [showInventory, setShowInventory] = useState(false)

    if (!isOpen) return null

    const getRarityGradient = (rarity: string) => {
        switch (rarity) {
            case 'common': return 'linear-gradient(135deg, #b0c3d9 0%, #8fa7c4 100%)'
            case 'uncommon': return 'linear-gradient(135deg, #5e98d9 0%, #4a7bc8 100%)'
            case 'rare': return 'linear-gradient(135deg, #4b69ff 0%, #3d54cc 100%)'
            case 'epic': return 'linear-gradient(135deg, #8847ff 0%, #6d38cc 100%)'
            case 'legendary': return 'linear-gradient(135deg, #d2a679 0%, #b8956a 100%)'
            default: return 'linear-gradient(135deg, #b0c3d9 0%, #8fa7c4 100%)'
        }
    }

    const handleItemSelect = (item: InventoryItem) => {
        const existingItem = selectedItems.find(selected => selected.id === item.id)
        if (existingItem) {
            // Remove item if already selected
            setSelectedItems(selectedItems.filter(selected => selected.id !== item.id))
        } else {
            // Add item to selection
            setSelectedItems([...selectedItems, { ...item, quantity: 1 }])
        }
    }

    const getTotalOfferedValue = () => {
        return selectedItems.reduce((total, item) => total + (item.value * item.quantity), 0)
    }

    const handleConfirmOffer = () => {
        const totalValue = getTotalOfferedValue()
        // TODO: Implement actual trade offer logic
        alert(`Trade offer sent to ${targetUser} for ${targetItem}!\nOffered items: ${selectedItems.map(item => item.name).join(', ')}\nTotal value: $${totalValue.toFixed(2)}`)
        setSelectedItems([])
        onClose()
        // Navigate to trade offers page to see the new offer
        navigate('/trade-offers')
    }

    const openInventory = () => {
        setShowInventory(true)
    }

    const closeInventory = () => {
        setShowInventory(false)
    }

    return (
        <div className="modal-overlay">
            <div className="trade-offer-modal">
                <div className="modal-header">
                    <h2>Trade Offer</h2>
                    <button className="close-button" onClick={onClose}>×</button>
                </div>

                <div className="trade-offer-content">
                    {/* Target User Info */}
                    <div className="target-user-section">
                        <div className="user-profile">
                            <div className="user-avatar">
                                <div className="avatar-placeholder">👤</div>
                            </div>
                            <div className="user-info">
                                <h3>{targetUser}</h3>
                                <p className="user-status">User</p>
                            </div>
                        </div>
                        <button className="report-button">🚩 Report</button>
                    </div>

                    {/* Trade Details */}
                    <div className="trade-details">
                        <div className="trade-info-grid">
                            <div className="info-item">
                                <span className="label">Accepting:</span>
                                <span className="value">Items & stable items</span>
                            </div>
                            <div className="info-item">
                                <span className="label">Time Left:</span>
                                <span className="value">3h 55m 27s</span>
                            </div>
                            <div className="info-item">
                                <span className="label">Item Value:</span>
                                <span className="value">${targetItemValue.toFixed(2)}</span>
                            </div>
                            <div className="info-item">
                                <span className="label">Sniping Prevention:</span>
                                <span className="value enabled">Enabled</span>
                            </div>
                            <div className="info-item">
                                <span className="label">Target Item:</span>
                                <span className="value">{targetItem}</span>
                            </div>
                        </div>

                        <button className="offer-trade-button" onClick={openInventory}>
                            Select Items to Offer
                        </button>
                    </div>

                    {/* Selected Items Section */}
                    <div className="selected-items-section">
                        <h3>Your Offer ({selectedItems.length} items - ${getTotalOfferedValue().toFixed(2)})</h3>
                        <div className="selected-items-grid">
                            {selectedItems.length === 0 ? (
                                <div className="no-items-selected">
                                    <p>No items selected. Click "Select Items to Offer" to choose items from your inventory.</p>
                                </div>
                            ) : (
                                selectedItems.map((item) => (
                                    <div key={item.id} className="selected-item-card">
                                        <div 
                                            className="item-header"
                                            style={{ background: getRarityGradient(item.rarity) }}
                                        >
                                            <div className="item-icon">🎮</div>
                                        </div>
                                        <div className="item-info">
                                            <p className="item-name">{item.name}</p>
                                            <p className="item-value">${item.value.toFixed(2)}</p>
                                            <button 
                                                className="remove-item"
                                                onClick={() => handleItemSelect(item)}
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Value Comparison */}
                    {selectedItems.length > 0 && (
                        <div className="value-comparison">
                            <div className="value-item">
                                <span className="label">Target Value:</span>
                                <span className="value">${targetItemValue.toFixed(2)}</span>
                            </div>
                            <div className="value-item">
                                <span className="label">Your Offer:</span>
                                <span className="value">${getTotalOfferedValue().toFixed(2)}</span>
                            </div>
                            <div className="value-item difference">
                                <span className="label">Difference:</span>
                                <span 
                                    className={`value ${getTotalOfferedValue() >= targetItemValue ? 'positive' : 'negative'}`}
                                >
                                    {getTotalOfferedValue() >= targetItemValue ? '+' : ''}
                                    ${(getTotalOfferedValue() - targetItemValue).toFixed(2)}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="modal-actions">
                        <button className="cancel-button" onClick={onClose}>
                            Cancel
                        </button>
                        <button 
                            className="confirm-button" 
                            onClick={handleConfirmOffer}
                            disabled={selectedItems.length === 0}
                        >
                            Confirm Offer
                        </button>
                    </div>
                </div>
            </div>

            {/* Inventory Selection Modal */}
            {showInventory && (
                <div className="inventory-modal-overlay">
                    <div className="inventory-modal">
                        <div className="inventory-header">
                            <h3>Select Items from Your Inventory</h3>
                            <button className="close-button" onClick={closeInventory}>×</button>
                        </div>
                        
                        <div className="inventory-grid">
                            {mockInventory.map((item) => {
                                const isSelected = selectedItems.some(selected => selected.id === item.id)
                                return (
                                    <div 
                                        key={item.id} 
                                        className={`inventory-item ${isSelected ? 'selected' : ''}`}
                                        onClick={() => handleItemSelect(item)}
                                    >
                                        <div 
                                            className="item-header"
                                            style={{ background: getRarityGradient(item.rarity) }}
                                        >
                                            <div className="item-icon">🎮</div>
                                            {item.quantity > 1 && (
                                                <div className="item-quantity">{item.quantity}</div>
                                            )}
                                        </div>
                                        <div className="item-info">
                                            <p className="item-name">{item.name}</p>
                                            <p className="item-rarity">{item.rarity}</p>
                                            <p className="item-value">${item.value.toFixed(2)}</p>
                                        </div>
                                        {isSelected && <div className="selected-indicator">✓</div>}
                                    </div>
                                )
                            })}
                        </div>
                        
                        <div className="inventory-actions">
                            <button className="done-button" onClick={closeInventory}>
                                Done Selecting ({selectedItems.length} items)
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
