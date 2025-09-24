"use client"

import type React from "react"
import { useState } from "react"
import { TradeOfferModal } from "./TradeOfferModal"

interface TradeItem {
    id: string
    name: string
    rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
    image?: string
    timeLeft: string
    percentage: number
    seller: string
    isStarred?: boolean
    value: number
}

// Mock data for demonstration
const mockTradeItems: TradeItem[] = [
    {
        id: '1',
        name: 'Specialized Killstreaks',
        rarity: 'rare',
        timeLeft: '3h 58m 19s',
        percentage: 1,
        seller: 'FERRAN',
        isStarred: false,
        value: 45.50
    },
    {
        id: '2',
        name: 'Blue And Green Gem',
        rarity: 'epic',
        timeLeft: '1h 58m 12s',
        percentage: 1,
        seller: 'shadowworld92',
        value: 32.75
    },
    {
        id: '3',
        name: 'Festi ughhhhh',
        rarity: 'uncommon',
        timeLeft: '3h 56m 46s',
        percentage: 2,
        seller: 'Frend',
        value: 8.50
    },
    {
        id: '4',
        name: 'STUFF',
        rarity: 'legendary',
        timeLeft: '3h 53m 6s',
        percentage: 3,
        seller: 'Tricksie',
        value: 125.00
    },
    {
        id: '5',
        name: 'Overcharged Le Sapeur',
        rarity: 'rare',
        timeLeft: '2h 53m 5s',
        percentage: 4,
        seller: 'voxpop',
        value: 28.25
    },
    {
        id: '6',
        name: 'Burstchester Unusualifier',
        rarity: 'epic',
        timeLeft: '1h 48m 44s',
        percentage: 5,
        seller: 'MrKiller1001',
        value: 67.80
    }
]

export const TradePage: React.FC = () => {
    const [selectedFilter, setSelectedFilter] = useState<'all' | 'starred'>('all')
    const [searchTerm, setSearchTerm] = useState('')
    const [isTradeModalOpen, setIsTradeModalOpen] = useState(false)
    const [selectedTradeItem, setSelectedTradeItem] = useState<{ name: string; seller: string; value: number } | null>(null)

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

    const filteredItems = mockTradeItems.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            item.seller.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesFilter = selectedFilter === 'all' || (selectedFilter === 'starred' && item.isStarred)
        return matchesSearch && matchesFilter
    })

    const handleOfferTrade = (itemName: string, seller: string, value: number) => {
        setSelectedTradeItem({ name: itemName, seller, value })
        setIsTradeModalOpen(true)
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
                    <div key={item.id} className="trade-item-card">
                        <div 
                            className="item-header"
                            style={{ background: getRarityGradient(item.rarity) }}
                        >
                            <div className="item-image-placeholder">
                                <div className="item-icon">🎮</div>
                            </div>
                            <div className="item-percentage">{item.percentage}%</div>
                        </div>

                        <div className="item-content">
                            <h3 className="item-name">{item.name}</h3>
                            <p className="item-seller">By <span className="seller-name">{item.seller}</span></p>
                            <p className="item-time">Ending in {item.timeLeft}</p>
                            <p className="item-value">${item.value.toFixed(2)}</p>
                            
                            <div className="item-actions">
                                <button 
                                    className="offer-trade-btn"
                                    onClick={() => handleOfferTrade(item.name, item.seller, item.value)}
                                >
                                    Offer Trade
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredItems.length === 0 && (
                <div className="no-items">
                    <p>No items found matching your criteria.</p>
                </div>
            )}

            {/* Trade Offer Modal */}
            {selectedTradeItem && (
                <TradeOfferModal
                    isOpen={isTradeModalOpen}
                    onClose={closeTradeModal}
                    targetUser={selectedTradeItem.seller}
                    targetItem={selectedTradeItem.name}
                    targetItemValue={selectedTradeItem.value}
                />
            )}
        </div>
    )
}
