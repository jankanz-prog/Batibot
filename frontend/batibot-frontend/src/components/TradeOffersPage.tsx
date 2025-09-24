"use client"

import type React from "react"
import { useState } from "react"

interface TradeOfferItem {
    id: string
    name: string
    rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
    value: number
    quantity: number
}

interface TradeOffer {
    id: string
    fromUser: string
    toUser: string
    targetItem: string
    targetItemValue: number
    offeredItems: TradeOfferItem[]
    totalOfferedValue: number
    status: 'pending' | 'accepted' | 'declined' | 'expired'
    createdAt: string
    expiresAt: string
    type: 'sent' | 'received'
}

// Mock trade offers data
const mockTradeOffers: TradeOffer[] = [
    {
        id: '1',
        fromUser: 'CurrentUser',
        toUser: 'FERRAN',
        targetItem: 'Specialized Killstreaks',
        targetItemValue: 45.50,
        offeredItems: [
            { id: '1', name: 'Ancient Sword', rarity: 'legendary', value: 25.00, quantity: 1 },
            { id: '2', name: 'Magic Shield', rarity: 'epic', value: 15.50, quantity: 1 },
            { id: '3', name: 'Steel Helmet', rarity: 'rare', value: 8.00, quantity: 1 }
        ],
        totalOfferedValue: 48.50,
        status: 'pending',
        createdAt: '2024-01-15 14:30:00',
        expiresAt: '2024-01-16 14:30:00',
        type: 'sent'
    },
    {
        id: '2',
        fromUser: 'shadowworld92',
        toUser: 'CurrentUser',
        targetItem: 'Blue And Green Gem',
        targetItemValue: 32.75,
        offeredItems: [
            { id: '4', name: 'Crystal Orb', rarity: 'epic', value: 18.25, quantity: 1 },
            { id: '5', name: 'Silver Ring', rarity: 'rare', value: 12.00, quantity: 2 }
        ],
        totalOfferedValue: 42.25,
        status: 'pending',
        createdAt: '2024-01-15 16:45:00',
        expiresAt: '2024-01-16 16:45:00',
        type: 'received'
    },
    {
        id: '3',
        fromUser: 'CurrentUser',
        toUser: 'Tricksie',
        targetItem: 'STUFF',
        targetItemValue: 125.00,
        offeredItems: [
            { id: '6', name: 'Ancient Sword', rarity: 'legendary', value: 25.00, quantity: 2 },
            { id: '7', name: 'Crystal Orb', rarity: 'epic', value: 18.25, quantity: 3 },
            { id: '8', name: 'Magic Shield', rarity: 'epic', value: 15.50, quantity: 1 }
        ],
        totalOfferedValue: 120.25,
        status: 'accepted',
        createdAt: '2024-01-14 10:20:00',
        expiresAt: '2024-01-15 10:20:00',
        type: 'sent'
    },
    {
        id: '4',
        fromUser: 'Frend',
        toUser: 'CurrentUser',
        targetItem: 'Festi ughhhhh',
        targetItemValue: 8.50,
        offeredItems: [
            { id: '9', name: 'Basic Potion', rarity: 'common', value: 2.25, quantity: 5 }
        ],
        totalOfferedValue: 11.25,
        status: 'declined',
        createdAt: '2024-01-14 09:15:00',
        expiresAt: '2024-01-15 09:15:00',
        type: 'received'
    }
]

export const TradeOffersPage: React.FC = () => {
    const [selectedFilter, setSelectedFilter] = useState<'all' | 'sent' | 'received' | 'pending' | 'completed'>('all')

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

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return '#ffc107'
            case 'accepted': return '#28a745'
            case 'declined': return '#dc3545'
            case 'expired': return '#6c757d'
            default: return '#6c757d'
        }
    }

    const getStatusText = (status: string) => {
        switch (status) {
            case 'pending': return 'Pending'
            case 'accepted': return 'Accepted'
            case 'declined': return 'Declined'
            case 'expired': return 'Expired'
            default: return 'Unknown'
        }
    }

    const filteredOffers = mockTradeOffers.filter(offer => {
        switch (selectedFilter) {
            case 'sent': return offer.type === 'sent'
            case 'received': return offer.type === 'received'
            case 'pending': return offer.status === 'pending'
            case 'completed': return offer.status === 'accepted' || offer.status === 'declined'
            default: return true
        }
    })

    const handleAcceptOffer = (offerId: string) => {
        // TODO: Implement accept offer functionality
        alert(`Accepting trade offer ${offerId}`)
    }

    const handleDeclineOffer = (offerId: string) => {
        // TODO: Implement decline offer functionality
        alert(`Declining trade offer ${offerId}`)
    }

    const handleCancelOffer = (offerId: string) => {
        // TODO: Implement cancel offer functionality
        alert(`Cancelling trade offer ${offerId}`)
    }

    return (
        <div className="trade-offers-page">
            <div className="trade-offers-header">
                <h2>Trade Offers</h2>
                <p>Manage your sent and received trade offers</p>
            </div>

            <div className="trade-offers-filters">
                <div className="filter-buttons">
                    <button 
                        className={`filter-btn ${selectedFilter === 'all' ? 'active' : ''}`}
                        onClick={() => setSelectedFilter('all')}
                    >
                        All Offers
                    </button>
                    <button 
                        className={`filter-btn ${selectedFilter === 'sent' ? 'active' : ''}`}
                        onClick={() => setSelectedFilter('sent')}
                    >
                        Sent
                    </button>
                    <button 
                        className={`filter-btn ${selectedFilter === 'received' ? 'active' : ''}`}
                        onClick={() => setSelectedFilter('received')}
                    >
                        Received
                    </button>
                    <button 
                        className={`filter-btn ${selectedFilter === 'pending' ? 'active' : ''}`}
                        onClick={() => setSelectedFilter('pending')}
                    >
                        Pending
                    </button>
                    <button 
                        className={`filter-btn ${selectedFilter === 'completed' ? 'active' : ''}`}
                        onClick={() => setSelectedFilter('completed')}
                    >
                        Completed
                    </button>
                </div>
            </div>

            <div className="trade-offers-list">
                {filteredOffers.map((offer) => (
                    <div key={offer.id} className="trade-offer-card">
                        <div className="offer-header">
                            <div className="offer-info">
                                <h3 className="offer-title">
                                    {offer.type === 'sent' ? 'Sent to' : 'Received from'} {' '}
                                    <span className="username">{offer.type === 'sent' ? offer.toUser : offer.fromUser}</span>
                                </h3>
                                <div className="offer-meta">
                                    <span className="offer-date">{offer.createdAt}</span>
                                    <span 
                                        className="offer-status"
                                        style={{ color: getStatusColor(offer.status) }}
                                    >
                                        {getStatusText(offer.status)}
                                    </span>
                                </div>
                            </div>
                            <div className="offer-type-badge">
                                {offer.type === 'sent' ? '📤' : '📥'}
                            </div>
                        </div>

                        <div className="offer-content">
                            {/* Target Item */}
                            <div className="target-section">
                                <h4>Target Item</h4>
                                <div className="target-item">
                                    <div className="item-icon">🎯</div>
                                    <div className="item-details">
                                        <p className="item-name">{offer.targetItem}</p>
                                        <p className="item-value">${offer.targetItemValue.toFixed(2)}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Offered Items */}
                            <div className="offered-section">
                                <h4>Offered Items (${offer.totalOfferedValue.toFixed(2)})</h4>
                                <div className="offered-items-grid">
                                    {offer.offeredItems.map((item) => (
                                        <div key={item.id} className="offered-item">
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
                                                <p className="item-value">${item.value.toFixed(2)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Value Comparison */}
                            <div className="value-comparison">
                                <div className="value-item">
                                    <span className="label">Target Value:</span>
                                    <span className="value">${offer.targetItemValue.toFixed(2)}</span>
                                </div>
                                <div className="value-item">
                                    <span className="label">Offered Value:</span>
                                    <span className="value">${offer.totalOfferedValue.toFixed(2)}</span>
                                </div>
                                <div className="value-item difference">
                                    <span className="label">Difference:</span>
                                    <span 
                                        className={`value ${offer.totalOfferedValue >= offer.targetItemValue ? 'positive' : 'negative'}`}
                                    >
                                        {offer.totalOfferedValue >= offer.targetItemValue ? '+' : ''}
                                        ${(offer.totalOfferedValue - offer.targetItemValue).toFixed(2)}
                                    </span>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            {offer.status === 'pending' && (
                                <div className="offer-actions">
                                    {offer.type === 'received' ? (
                                        <>
                                            <button 
                                                className="accept-btn"
                                                onClick={() => handleAcceptOffer(offer.id)}
                                            >
                                                Accept Offer
                                            </button>
                                            <button 
                                                className="decline-btn"
                                                onClick={() => handleDeclineOffer(offer.id)}
                                            >
                                                Decline
                                            </button>
                                        </>
                                    ) : (
                                        <button 
                                            className="cancel-btn"
                                            onClick={() => handleCancelOffer(offer.id)}
                                        >
                                            Cancel Offer
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {filteredOffers.length === 0 && (
                <div className="no-offers">
                    <p>No trade offers found for the selected filter.</p>
                </div>
            )}
        </div>
    )
}
