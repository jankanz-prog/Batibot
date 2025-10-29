"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import { tradeAPI } from "../services/tradeAPI"
import { TradeOfferModal } from "./TradeOfferModal"
import { liveTradeWS } from "../services/liveTradeWebSocket"

interface MarketplaceItem {
    inventory_id: string
    item_id: number
    name: string
    description: string
    rarity: string
    category: string
    value: number
    quantity: number
    seller_id: number
    seller: string
    image?: string
}

export const TradePage: React.FC = () => {
    const { token } = useAuth()
    const [selectedFilter, setSelectedFilter] = useState<'all' | 'starred'>('all')
    const [searchTerm, setSearchTerm] = useState('')
    const [isTradeModalOpen, setIsTradeModalOpen] = useState(false)
    const [selectedTradeItem, setSelectedTradeItem] = useState<{ item_id: number; name: string; seller: string; seller_id: number; value: number } | null>(null)
    const [marketplaceItems, setMarketplaceItems] = useState<MarketplaceItem[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Load marketplace items
    useEffect(() => {
        const loadMarketplace = async () => {
            if (!token) return
            
            try {
                setIsLoading(true)
                setError(null)
                const response = await tradeAPI.getMarketplaceItems(token)
                
                if (response.success) {
                    setMarketplaceItems(response.data)
                    console.log('✅ Loaded marketplace items:', response.data.length)
                } else {
                    setError(response.message || 'Failed to load marketplace')
                }
            } catch (err: any) {
                console.error('❌ Failed to load marketplace:', err)
                setError(err.message || 'Failed to load marketplace items')
            } finally {
                setIsLoading(false)
            }
        }

        loadMarketplace()
    }, [token])

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

    const filteredItems = marketplaceItems.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            item.seller.toLowerCase().includes(searchTerm.toLowerCase())
        // TODO: Implement starred/favorite feature if needed
        const matchesFilter = selectedFilter === 'all'
        return matchesSearch && matchesFilter
    })

    const handleOfferTrade = (item: MarketplaceItem) => {
        setSelectedTradeItem({ 
            item_id: item.item_id,
            name: item.name, 
            seller: item.seller,
            seller_id: item.seller_id, 
            value: item.value 
        })
        setIsTradeModalOpen(true)
    }

    const handleLiveTrade = (item: MarketplaceItem) => {
        // Check if live trade WebSocket is connected
        if (!liveTradeWS.isConnected()) {
            alert('❌ Live trade service is not connected. Please refresh the page.')
            return
        }

        // Send live trade invite (backend will check if user is online)
        liveTradeWS.sendTradeInvite(item.seller_id, item.seller)
        alert(`✅ Live trade request sent to ${item.seller}!\n\nWaiting for them to accept...`)
    }

    const closeTradeModal = () => {
        setIsTradeModalOpen(false)
        setSelectedTradeItem(null)
    }

    return (
        <div className="trade-page">
            <div className="trade-header">
                <h2>Trade Marketplace</h2>
                <p>Browse and trade items with other players</p>
            </div>

            {isLoading && (
                <div className="loading-state">
                    <p>Loading marketplace items...</p>
                </div>
            )}

            {error && (
                <div className="error-state">
                    <p>❌ {error}</p>
                    <button onClick={() => window.location.reload()}>Retry</button>
                </div>
            )}

            {!isLoading && !error && (
                <>
                    <div className="trade-filters">
                        <div className="filter-buttons">
                            <button 
                                className={`filter-btn ${selectedFilter === 'all' ? 'active' : ''}`}
                                onClick={() => setSelectedFilter('all')}
                            >
                                All Auctions
                            </button>
                            <button 
                                className={`filter-btn ${selectedFilter === 'starred' ? 'active' : ''}`}
                                onClick={() => setSelectedFilter('starred')}
                            >
                                My Auctions
                            </button>
                        </div>

                        <div className="search-container">
                            <input
                                type="text"
                                placeholder="Search items or sellers..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="search-input"
                            />
                        </div>
                    </div>

                    <div className="trade-grid">
                        {filteredItems.map((item) => (
                            <div key={item.inventory_id} className="trade-item-card">
                                <div 
                                    className="item-header"
                                    style={{ background: getRarityGradient(item.rarity.toLowerCase()) }}
                                >
                                    <div className="item-image-placeholder">
                                        <div className="item-icon">🎮</div>
                                    </div>
                                    <div className="item-rarity-badge">{item.rarity}</div>
                                </div>

                                <div className="item-content">
                                    <h3 className="item-name">{item.name}</h3>
                                    <p className="item-category">{item.category}</p>
                                    <p className="item-seller">By <span className="seller-name">{item.seller}</span></p>
                                    <p className="item-quantity">Quantity: {item.quantity}</p>
                                    <p className="item-value">${Number(item.value || 0).toFixed(2)}</p>
                                    
                                    <div className="item-actions">
                                        <button 
                                            className="offer-trade-btn"
                                            onClick={() => handleOfferTrade(item)}
                                        >
                                            📨 Offer Trade
                                        </button>
                                        <button 
                                            className="live-trade-btn"
                                            onClick={() => handleLiveTrade(item)}
                                        >
                                            ⚡ Live Trade
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {filteredItems.length === 0 && !isLoading && (
                        <div className="no-items">
                            <p>No items found matching your criteria.</p>
                        </div>
                    )}
                </>
            )}

            {/* Trade Offer Modal */}
            {selectedTradeItem && (
                <TradeOfferModal
                    isOpen={isTradeModalOpen}
                    onClose={closeTradeModal}
                    targetUserId={selectedTradeItem.seller_id}
                    targetUser={selectedTradeItem.seller}
                    targetItemId={selectedTradeItem.item_id}
                    targetItem={selectedTradeItem.name}
                    targetItemValue={selectedTradeItem.value}
                />
            )}
        </div>
    )
}
