"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { inventoryAPI } from "../services/itemsAPI"
import { tradeAPI } from "../services/tradeAPI"

interface TradeInventoryItem {
    id: string
    inventory_id: number
    item_id: number
    name: string
    rarity: string
    category: string
    image?: string
    quantity: number
    value: number
}

interface TradeOfferModalProps {
    isOpen: boolean
    onClose: () => void
    targetUserId: number
    targetUser: string
    targetItemId: number
    targetItem: string
    targetItemValue: number
}


export const TradeOfferModal: React.FC<TradeOfferModalProps> = ({
    isOpen,
    onClose,
    targetUserId,
    targetUser,
    targetItemId,
    targetItem,
    targetItemValue
}) => {
    const navigate = useNavigate()
    const { token } = useAuth()
    const [selectedItems, setSelectedItems] = useState<TradeInventoryItem[]>([])
    const [showInventory, setShowInventory] = useState(false)
    const [userInventory, setUserInventory] = useState<TradeInventoryItem[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Load user's inventory when modal opens
    useEffect(() => {
        if (isOpen && token) {
            loadInventory()
        }
    }, [isOpen, token])

    const loadInventory = async () => {
        if (!token) return
        
        try {
            setIsLoading(true)
            const response = await inventoryAPI.getInventory(token)
            
            if (response.success && response.data) {
                // Transform API data to match component interface
                const formattedInventory: TradeInventoryItem[] = response.data
                    .filter(inv => inv.Item?.is_tradeable !== false) // Only tradeable items
                    .map(inv => ({
                        id: inv.inventory_id.toString(),
                        inventory_id: inv.inventory_id,
                        item_id: inv.item_id,
                        name: inv.Item?.name || 'Unknown Item',
                        rarity: inv.Item?.rarity?.name?.toLowerCase() || 'common',
                        category: inv.Item?.category?.name?.toLowerCase() || 'misc',
                        quantity: inv.quantity,
                        value: Number(inv.Item?.value || 0),
                        image: inv.Item?.image_url
                    }))
                
                setUserInventory(formattedInventory)
                console.log('✅ Loaded inventory:', formattedInventory.length, 'items')
            }
        } catch (error: any) {
            console.error('Failed to load inventory:', error)
        } finally {
            setIsLoading(false)
        }
    }

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

    const handleItemSelect = (item: TradeInventoryItem) => {
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
        return selectedItems.reduce((total, item) => total + (Number(item.value) * item.quantity), 0)
    }

    const handleConfirmOffer = async () => {
        if (!token || selectedItems.length === 0) return

        try {
            setIsSubmitting(true)

            // Prepare trade data
            const tradeData = {
                receiver_id: targetUserId,
                sender_items: selectedItems.map(item => ({
                    item_id: item.item_id,
                    quantity: item.quantity
                })),
                receiver_items: [{
                    item_id: targetItemId,
                    quantity: 1
                }]
            }

            console.log('📤 Creating trade offer:', tradeData)
            const response = await tradeAPI.createTradeOffer(tradeData, token)

            if (response.success) {
                const totalValue = getTotalOfferedValue()
                alert(`✅ Trade offer sent successfully!\n\nSent to: ${targetUser}\nFor: ${targetItem}\nYour offer: ${selectedItems.map(item => item.name).join(', ')}\nTotal value: $${totalValue.toFixed(2)}\n\nCheck the Trade Offers page to see your offer!`)
                
                setSelectedItems([])
                onClose()
                
                // Navigate to trade offers page to see the new offer
                navigate('/trade-offers')
            } else {
                throw new Error(response.message || 'Failed to create trade offer')
            }
        } catch (error: any) {
            console.error('❌ Error creating trade offer:', error)
            alert(`Failed to create trade offer:\n${error.message || 'Unknown error'}`)
        } finally {
            setIsSubmitting(false)
        }
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
                                <span className="value">${Number(targetItemValue || 0).toFixed(2)}</span>
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
                                            <p className="item-value">${Number(item.value || 0).toFixed(2)}</p>
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
                                <span className="value">${Number(targetItemValue || 0).toFixed(2)}</span>
                            </div>
                            <div className="value-item">
                                <span className="label">Your Offer:</span>
                                <span className="value">${getTotalOfferedValue().toFixed(2)}</span>
                            </div>
                            <div className="value-item difference">
                                <span className="label">Difference:</span>
                                <span 
                                    className={`value ${getTotalOfferedValue() >= Number(targetItemValue || 0) ? 'positive' : 'negative'}`}
                                >
                                    {getTotalOfferedValue() >= Number(targetItemValue || 0) ? '+' : ''}
                                    ${(getTotalOfferedValue() - Number(targetItemValue || 0)).toFixed(2)}
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
                            disabled={selectedItems.length === 0 || isSubmitting}
                        >
                            {isSubmitting ? 'Sending Offer...' : 'Confirm Offer'}
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
                            {isLoading ? (
                                <div className="loading-inventory">
                                    <p>Loading your inventory...</p>
                                </div>
                            ) : userInventory.length === 0 ? (
                                <div className="empty-inventory">
                                    <p>Your inventory is empty</p>
                                </div>
                            ) : (
                                userInventory.map((item) => {
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
                                            <p className="item-value">${Number(item.value || 0).toFixed(2)}</p>
                                        </div>
                                        {isSelected && <div className="selected-indicator">✓</div>}
                                    </div>
                                )
                            })
                            )}
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
