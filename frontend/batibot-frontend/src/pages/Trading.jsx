import { useState, useEffect } from 'react'
import { Search, Users, ArrowLeftRight, Clock, CheckCircle, Filter } from 'lucide-react'

const Trading = ({ user }) => {
  const [availableTrades, setAvailableTrades] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedGame, setSelectedGame] = useState('all')
  const [selectedRarity, setSelectedRarity] = useState('all')
  const [showActiveOnly, setShowActiveOnly] = useState(true)
  const [showMyOffers, setShowMyOffers] = useState(false)

  // Mock trade data matching Dota 2 interface
  useEffect(() => {
    const mockTrades = [
      {
        id: 1,
        trader: "ESDEATH~",
        traderAvatar: "/api/placeholder/32/32",
        offering: [
          { id: 1, name: "Pudge Hook", game: "Dota 2", rarity: "legendary" },
          { id: 2, name: "Crystal Maiden Set", game: "Dota 2", rarity: "rare" }
        ],
        wanting: [
          { id: 3, name: "Invoker Immortal", game: "Dota 2", rarity: "immortal" },
          { id: 4, name: "Pudge Arcana", game: "Dota 2", rarity: "ancient" },
          { id: 5, name: "Drow Ranger Set", game: "Dota 2", rarity: "mythical" },
          { id: 6, name: "Anti-Mage Persona", game: "Dota 2", rarity: "legendary" },
          { id: 7, name: "Windranger Arcana", game: "Dota 2", rarity: "ancient" },
          { id: 8, name: "Phantom Assassin Set", game: "Dota 2", rarity: "rare" }
        ],
        status: "active",
        createdAt: "9 minutes ago"
      },
      {
        id: 2,
        trader: "ESDEATH~",
        traderAvatar: "/api/placeholder/32/32",
        offering: [
          { id: 11, name: "Pudge Hook", game: "Dota 2", rarity: "legendary" },
          { id: 12, name: "Crystal Maiden Set", game: "Dota 2", rarity: "rare" }
        ],
        wanting: [
          { id: 13, name: "Empire Sticker", game: "CS:GO", rarity: "rare" },
          { id: 14, name: "LOTV Sticker", game: "CS:GO", rarity: "rare" }
        ],
        status: "active",
        createdAt: "in 11 hours"
      },
      {
        id: 3,
        trader: "ProGamer2024",
        traderAvatar: "/api/placeholder/32/32",
        offering: [
          { id: 15, name: "AK-47 Redline", game: "CS:GO", rarity: "mythical" }
        ],
        wanting: [
          { id: 16, name: "AWP Dragon Lore", game: "CS:GO", rarity: "legendary" },
          { id: 17, name: "M4A4 Asiimov", game: "CS:GO", rarity: "rare" }
        ],
        status: "active",
        createdAt: "14 hours ago"
      },
      {
        id: 4,
        trader: "TradeMaster",
        traderAvatar: "/api/placeholder/32/32",
        offering: [
          { id: 18, name: "Golden Wrench", game: "TF2", rarity: "immortal" },
          { id: 19, name: "Unusual Hat", game: "TF2", rarity: "ancient" }
        ],
        wanting: [
          { id: 20, name: "Knife Karambit", game: "CS:GO", rarity: "legendary" },
          { id: 21, name: "Gloves Crimson", game: "CS:GO", rarity: "ancient" }
        ],
        status: "active",
        createdAt: "1 day ago"
      },
      {
        id: 5,
        trader: "ItemCollector",
        traderAvatar: "/api/placeholder/32/32",
        offering: [
          { id: 22, name: "Techies Arcana", game: "Dota 2", rarity: "ancient" }
        ],
        wanting: [
          { id: 23, name: "Invoker Persona", game: "Dota 2", rarity: "legendary" },
          { id: 24, name: "Pudge Immortal", game: "Dota 2", rarity: "immortal" },
          { id: 25, name: "Crystal Maiden Arcana", game: "Dota 2", rarity: "ancient" }
        ],
        status: "active",
        createdAt: "2 days ago"
      }
    ]
    setAvailableTrades(mockTrades)
  }, [])

  const TradeCard = ({ trade }) => (
    <div className="trade-card">
      <div className="trade-card-header">
        <div className="trader-info">
          <img src={trade.traderAvatar} alt={trade.trader} className="trader-avatar" />
          <span className="trader-name">{trade.trader}</span>
        </div>
        <div className="trade-time">
          <Clock size={14} />
          <span>{trade.createdAt}</span>
        </div>
      </div>

      <div className="trade-content">
        {/* Offering Section */}
        <div className="trade-section offering-section">
          <div className="trade-section-header">
            <span className="section-title">Offers ({trade.offering.length})</span>
          </div>
          <div className="items-container">
            {trade.offering.map(item => (
              <div key={item.id} className={`trade-item rarity-${item.rarity}`} title={item.name}>
                <div className="item-placeholder"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Arrow */}
        <div className="trade-arrow-container">
          <ArrowLeftRight size={20} className="trade-arrow-icon" />
        </div>

        {/* Wanting Section */}
        <div className="trade-section wanting-section">
          <div className="trade-section-header">
            <span className="section-title">Wants ({trade.wanting.length})</span>
          </div>
          <div className="items-container">
            {trade.wanting.map(item => (
              <div key={item.id} className={`trade-item rarity-${item.rarity}`} title={item.name}>
                <div className="item-placeholder"></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="trade-actions">
        <button className="btn trade-btn">
          Details
        </button>
        <button className="btn btn-primary trade-btn">
          Make an Offer
        </button>
      </div>
    </div>
  )

  const filteredTrades = availableTrades.filter(trade => {
    const matchesSearch = trade.trader.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesGame = selectedGame === 'all' || 
      trade.offering.some(item => item.game === selectedGame) ||
      trade.wanting.some(item => item.game === selectedGame)
    const matchesRarity = selectedRarity === 'all' ||
      trade.offering.some(item => item.rarity === selectedRarity) ||
      trade.wanting.some(item => item.rarity === selectedRarity)
    
    return matchesSearch && matchesGame && matchesRarity
  })

  if (!user) {
    return (
      <div className="auth-container">
        <div className="auth-box">
          <h2 className="auth-title">Please Login</h2>
          <p style={{ textAlign: 'center', color: '#b8b6b4' }}>
            You need to be logged in to access trading.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="main-container">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-section">
          <div className="sidebar-title">
            <Search size={16} style={{ display: 'inline', marginRight: '8px' }} />
            Search
          </div>
          <input
            type="text"
            placeholder="Search traders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-box"
          />
        </div>

        <div className="sidebar-section">
          <div className="sidebar-title">
            <Filter size={16} style={{ display: 'inline', marginRight: '8px' }} />
            Filters
          </div>
          
          <div className="filter-group">
            <label className="filter-label">Game</label>
            <select
              value={selectedGame}
              onChange={(e) => setSelectedGame(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Games</option>
              <option value="CS:GO">CS:GO</option>
              <option value="Dota 2">Dota 2</option>
              <option value="TF2">Team Fortress 2</option>
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Rarity</label>
            <select
              value={selectedRarity}
              onChange={(e) => setSelectedRarity(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Rarities</option>
              <option value="common">Common</option>
              <option value="uncommon">Uncommon</option>
              <option value="rare">Rare</option>
              <option value="mythical">Mythical</option>
              <option value="legendary">Legendary</option>
              <option value="ancient">Ancient</option>
              <option value="immortal">Immortal</option>
            </select>
          </div>
        </div>

        <div className="sidebar-section">
          <div className="sidebar-title">Trade Status</div>
          <div className="status-filters">
            <label className="status-filter">
              <input 
                type="checkbox" 
                checked={showActiveOnly}
                onChange={(e) => setShowActiveOnly(e.target.checked)}
              />
              <span>Active Trades</span>
            </label>
            <label className="status-filter">
              <input 
                type="checkbox"
                checked={showMyOffers}
                onChange={(e) => setShowMyOffers(e.target.checked)}
              />
              <span>My Offers</span>
            </label>
          </div>
        </div>

        <div className="sidebar-section">
          <div className="sidebar-title">Quick Actions</div>
          <button className="btn btn-primary" style={{ width: '100%', marginBottom: '8px' }}>
            Create Trade
          </button>
          <button className="btn" style={{ width: '100%' }}>
            My Inventory
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="content-area">
        <div className="content-header">
          <h2 className="content-title">Trading Hub</h2>
          <div className="trade-count">
            {filteredTrades.length} trades available
          </div>
        </div>
        
        <div className="trades-grid">
          {filteredTrades.length > 0 ? (
            filteredTrades.map(trade => (
              <TradeCard key={trade.id} trade={trade} />
            ))
          ) : (
            <div style={{ 
              textAlign: 'center', 
              padding: '60px 20px', 
              color: '#8f98a0',
              fontSize: '16px'
            }}>
              <Users size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
              <p>No trades found matching your criteria</p>
              <p style={{ fontSize: '14px', marginTop: '8px' }}>
                Try adjusting your filters or search terms
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Trading
