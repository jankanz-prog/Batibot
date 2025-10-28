"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import { tradeAPI } from "../services/tradeAPI"

interface TradeOfferItem {
    item_id: number
    name: string
    rarity: string
    category: string
    value: number
    quantity: number
}

interface TradeOffer {
    trade_id: string
    sender_id: number
    sender: string
    receiver_id: number
    receiver: string
    status: string
    created_at: string
    type: 'sent' | 'received'
    sender_items: TradeOfferItem[]
    receiver_items: TradeOfferItem[]
}

export const TradeOffersPage: React.FC = () => {
    const { token } = useAuth()
    const [selectedFilter, setSelectedFilter] = useState<'all' | 'sent' | 'received' | 'pending' | 'completed'>('all')
    const [tradeOffers, setTradeOffers] = useState<TradeOffer[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Load trade offers
    useEffect(() => {
        loadTradeOffers()
    }, [token])

    const loadTradeOffers = async () => {
        if (!token) return
        
        try {
            setIsLoading(true)
            setError(null)
            const response = await tradeAPI.getTradeOffers(token)
            
            if (response.success) {
                setTradeOffers(response.data)
                console.log('✅ Loaded trade offers:', response.data.length)
            } else {
                setError(response.message || 'Failed to load trade offers')
            }
        } catch (err: any) {
            console.error('❌ Failed to load trade offers:', err)
            setError(err.message || 'Failed to load trade offers')
        } finally {
            setIsLoading(false)
        }
    }

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
            case 'accepted': case 'completed': return '#28a745'
            case 'declined': case 'rejected': return '#dc3545'
            case 'expired': return '#6c757d'
            default: return '#6c757d'
        }
    }

    const filteredOffers = tradeOffers.filter(offer => {
        switch (selectedFilter) {
            case 'sent': return offer.type === 'sent'
            case 'received': return offer.type === 'received'
            case 'pending': return offer.status === 'Pending'
            case 'completed': return offer.status === 'Completed' || offer.status === 'Rejected'
            default: return true
        }
    })

    const handleAcceptOffer = async (tradeId: string) => {
        if (!token) return
        
        try {
            const response = await tradeAPI.acceptTradeOffer(tradeId, token)
            
            if (response.success) {
                console.log('✅ Trade accepted successfully')
                // Reload trade offers
                await loadTradeOffers()
                alert('Trade completed successfully! Items have been exchanged.')
            } else {
                alert(`Failed to accept trade: ${response.message}`)
            }
        } catch (err: any) {
            console.error('❌ Failed to accept trade:', err)
            alert(`Error: ${err.message}`)
        }
    }

    const handleDeclineOffer = async (tradeId: string) => {
        if (!token) return
        
        try {
            const response = await tradeAPI.rejectTradeOffer(tradeId, token)
            
            if (response.success) {
                console.log('✅ Trade declined successfully')
                // Reload trade offers
                await loadTradeOffers()
            } else {
                alert(`Failed to decline trade: ${response.message}`)
            }
        } catch (err: any) {
            console.error('❌ Failed to decline trade:', err)
            alert(`Error: ${err.message}`)
        }
    }

    const handleCancelOffer = async (tradeId: string) => {
        if (!token) return
        
        if (!confirm('Are you sure you want to cancel this trade offer?')) return
        
        try {
            const response = await tradeAPI.cancelTradeOffer(tradeId, token)
            
            if (response.success) {
                console.log('✅ Trade cancelled successfully')
                // Reload trade offers
                await loadTradeOffers()
            } else {
                alert(`Failed to cancel trade: ${response.message}`)
            }
        } catch (err: any) {
            console.error('❌ Failed to cancel trade:', err)
            alert(`Error: ${err.message}`)
        }
    }

    return (
        <div className="trade-offers-page">
            <div className="trade-offers-header">
                <h2>Trade Offers</h2>
                <p>Manage your sent and received trade offers</p>
            </div>

            {isLoading && (
                <div className="loading-state">
                    <p>Loading trade offers...</p>
                </div>
            )}

            {error && (
                <div className="error-state">
                    <p>❌ {error}</p>
                    <button onClick={() => loadTradeOffers()}>Retry</button>
                </div>
            )}

            {!isLoading && !error && (
                <>
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
                {filteredOffers.map((offer) => {
                    // For clarity: What you're giving vs what you're getting
                    const youGiveItems = offer.type === 'sent' ? offer.sender_items : offer.receiver_items
                    const youGetItems = offer.type === 'sent' ? offer.receiver_items : offer.sender_items
                    const totalYouGiveValue = youGiveItems.reduce((sum: number, item: TradeOfferItem) => sum + (Number(item.value || 0) * item.quantity), 0)
                    const totalYouGetValue = youGetItems.reduce((sum: number, item: TradeOfferItem) => sum + (Number(item.value || 0) * item.quantity), 0)
                    
                    // User-friendly labels
                    const youGiveLabel = offer.type === 'sent' ? "You're Offering" : "They Want From You"
                    const youGetLabel = offer.type === 'sent' ? "You Want" : "They're Offering You"
                    const youGiveTooltip = offer.type === 'sent' 
                        ? "Items you're offering in this trade"
                        : `What ${offer.sender} wants from you`
                    const youGetTooltip = offer.type === 'sent'
                        ? `What you want from ${offer.receiver}`
                        : `What ${offer.sender} is offering for your items`
                    
                    return (
                    <div key={offer.trade_id} className="trade-offer-card">
                        <div className="offer-header">
                            <div className="offer-info">
                                <h3 className="offer-title">
                                    {offer.type === 'sent' ? 'Sent to' : 'Received from'} {' '}
                                    <span className="username">{offer.type === 'sent' ? offer.receiver : offer.sender}</span>
                                </h3>
                                <div className="offer-meta">
                                    <span className="offer-date">{new Date(offer.created_at).toLocaleString()}</span>
                                    <span 
                                        className="offer-status"
                                        style={{ color: getStatusColor(offer.status.toLowerCase()) }}
                                    >
                                        {offer.status}
                                    </span>
                                </div>
                            </div>
                            <div className="offer-type-badge">
                                {offer.type === 'sent' ? '📤' : '📥'}
                            </div>
                        </div>

                        <div className="offer-content">
                            {/* What You Get */}
                            <div className="target-section you-get-section">
                                <h4>
                                    <span className="section-icon">📥</span>
                                    {youGetLabel} (${totalYouGetValue.toFixed(2)})
                                    <span className="info-tooltip" title={youGetTooltip}>ℹ️</span>
                                </h4>
                                <div className="offered-items-grid">
                                    {youGetItems.map((item: TradeOfferItem, idx: number) => (
                                        <div key={`${item.item_id}-${idx}`} className="offered-item">
                                            <div 
                                                className="item-header"
                                                style={{ background: getRarityGradient(item.rarity.toLowerCase()) }}
                                            >
                                                <div className="item-icon">🎮</div>
                                                {item.quantity > 1 && (
                                                    <div className="item-quantity">{item.quantity}</div>
                                                )}
                                            </div>
                                            <div className="item-info">
                                                <p className="item-name">{item.name}</p>
                                                <p className="item-category">{item.category}</p>
                                                <p className="item-value">${Number(item.value || 0).toFixed(2)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* What You Give */}
                            <div className="offered-section you-give-section">
                                <h4>
                                    <span className="section-icon">📤</span>
                                    {youGiveLabel} (${totalYouGiveValue.toFixed(2)})
                                    <span className="info-tooltip" title={youGiveTooltip}>ℹ️</span>
                                </h4>
                                <div className="offered-items-grid">
                                    {youGiveItems.map((item: TradeOfferItem, idx: number) => (
                                        <div key={`${item.item_id}-${idx}`} className="offered-item">
                                            <div 
                                                className="item-header"
                                                style={{ background: getRarityGradient(item.rarity.toLowerCase()) }}
                                            >
                                                <div className="item-icon">🎮</div>
                                                {item.quantity > 1 && (
                                                    <div className="item-quantity">{item.quantity}</div>
                                                )}
                                            </div>
                                            <div className="item-info">
                                                <p className="item-name">{item.name}</p>
                                                <p className="item-category">{item.category}</p>
                                                <p className="item-value">${Number(item.value || 0).toFixed(2)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Value Comparison */}
                            <div className="value-comparison">
                                <div className="value-item">
                                    <span className="label">You Get:</span>
                                    <span className="value">${totalYouGetValue.toFixed(2)}</span>
                                </div>
                                <div className="value-item">
                                    <span className="label">You Give:</span>
                                    <span className="value">${totalYouGiveValue.toFixed(2)}</span>
                                </div>
                                <div className="value-item difference">
                                    <span className="label">Net Gain:</span>
                                    <span 
                                        className={`value ${totalYouGetValue >= totalYouGiveValue ? 'positive' : 'negative'}`}
                                    >
                                        {totalYouGetValue >= totalYouGiveValue ? '+' : ''}
                                        ${(totalYouGetValue - totalYouGiveValue).toFixed(2)}
                                    </span>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            {offer.status === 'Pending' && (
                                <div className="offer-actions">
                                    {offer.type === 'received' ? (
                                        <>
                                            <button 
                                                className="accept-btn"
                                                onClick={() => handleAcceptOffer(offer.trade_id)}
                                            >
                                                Accept Offer
                                            </button>
                                            <button 
                                                className="decline-btn"
                                                onClick={() => handleDeclineOffer(offer.trade_id)}
                                            >
                                                Decline
                                            </button>
                                        </>
                                    ) : (
                                        <button 
                                            className="cancel-btn"
                                            onClick={() => handleCancelOffer(offer.trade_id)}
                                        >
                                            Cancel Offer
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                    )
                })}
            </div>

            {filteredOffers.length === 0 && !isLoading && (
                <div className="no-offers">
                    <p>No trade offers found for the selected filter.</p>
                </div>
            )}
                </>
            )}
        </div>
    )
}
