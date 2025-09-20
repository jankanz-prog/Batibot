import { useState, useEffect } from 'react'
import { Search, Filter, Grid, List, Package } from 'lucide-react'

const Inventory = ({ user }) => {
  const [items, setItems] = useState([])
  const [filteredItems, setFilteredItems] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedGame, setSelectedGame] = useState('all')
  const [selectedRarity, setSelectedRarity] = useState('all')
  const [viewMode, setViewMode] = useState('grid')

  // Mock data - will be replaced with API calls
  useEffect(() => {
    const mockItems = [
      {
        id: 1,
        name: "AK-47 | Redline",
        game: "CS:GO",
        rarity: "mythical",
        image: "/api/placeholder/120/120",
        price: "$45.00",
        tradeable: true
      },
      {
        id: 2,
        name: "AWP | Dragon Lore",
        game: "CS:GO",
        rarity: "legendary",
        image: "/api/placeholder/120/120",
        price: "$2,400.00",
        tradeable: true
      },
      {
        id: 3,
        name: "Pudge Hook",
        game: "Dota 2",
        rarity: "legendary",
        image: "/api/placeholder/120/120",
        price: "$120.00",
        tradeable: true
      },
      {
        id: 4,
        name: "Arcana - Pudge",
        game: "Dota 2",
        rarity: "ancient",
        image: "/api/placeholder/120/120",
        price: "$35.00",
        tradeable: false
      },
      {
        id: 5,
        name: "Unusual Hat",
        game: "TF2",
        rarity: "ancient",
        image: "/api/placeholder/120/120",
        price: "$200.00",
        tradeable: true
      },
      {
        id: 6,
        name: "Golden Wrench",
        game: "TF2",
        rarity: "immortal",
        image: "/api/placeholder/120/120",
        price: "$5,000.00",
        tradeable: true
      }
    ]
    setItems(mockItems)
    setFilteredItems(mockItems)
  }, [])

  useEffect(() => {
    let filtered = items

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedGame !== 'all') {
      filtered = filtered.filter(item => item.game === selectedGame)
    }

    if (selectedRarity !== 'all') {
      filtered = filtered.filter(item => item.rarity === selectedRarity)
    }

    setFilteredItems(filtered)
  }, [searchTerm, selectedGame, selectedRarity, items])

  if (!user) {
    return (
      <div className="inventory-container">
        <div className="text-center py-20">
          <Package size={64} className="mx-auto mb-4 text-gray-600" />
          <h2 className="text-2xl font-bold mb-4">Please Login</h2>
          <p className="text-gray-400">You need to be logged in to view your inventory.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="inventory-container">
      {/* Header */}
      <div className="inventory-header">
        <div className="header-content">
          <div className="header-left">
            <Package className="header-icon" />
            <h1 className="header-title">My Inventory</h1>
            <span className="item-count">{filteredItems.length} items available</span>
          </div>
          <div className="view-controls">
            <button
              onClick={() => setViewMode('grid')}
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
            >
              <Grid size={18} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
            >
              <List size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filters-container">
          <div className="search-container">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <select
            value={selectedGame}
            onChange={(e) => setSelectedGame(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Games</option>
            <option value="CS:GO">CS:GO</option>
            <option value="Dota 2">Dota 2</option>
            <option value="TF2">TF2</option>
          </select>

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

          <div className="filter-info">
            <Filter size={16} />
            <span>{filteredItems.length} of {items.length} items</span>
          </div>
        </div>
      </div>

      {/* Items Display */}
      <div className="inventory-content">
        {viewMode === 'grid' ? (
          <div className="items-grid">
            {filteredItems.map(item => (
              <div key={item.id} className={`inventory-item rarity-${item.rarity}`}>
                <div className="item-image-container">
                  <div className="item-placeholder"></div>
                  {!item.tradeable && (
                    <div className="not-tradeable-badge">NT</div>
                  )}
                </div>
                <div className="item-details">
                  <h3 className="item-name" title={item.name}>{item.name}</h3>
                  <p className="item-game">{item.game}</p>
                  <div className="item-footer">
                    <span className={`rarity-badge rarity-${item.rarity}`}>
                      {item.rarity.charAt(0).toUpperCase() + item.rarity.slice(1)}
                    </span>
                    <span className="item-price">{item.price}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="items-list">
            {filteredItems.map(item => (
              <div key={item.id} className={`inventory-item-list rarity-${item.rarity}`}>
                <div className="list-item-image">
                  <div className="item-placeholder"></div>
                </div>
                <div className="list-item-info">
                  <h3 className="item-name">{item.name}</h3>
                  <p className="item-game">{item.game}</p>
                </div>
                <div className="list-item-rarity">
                  <span className={`rarity-badge rarity-${item.rarity}`}>
                    {item.rarity.charAt(0).toUpperCase() + item.rarity.slice(1)}
                  </span>
                </div>
                <div className="list-item-price">
                  <span className="item-price">{item.price}</span>
                  {!item.tradeable && (
                    <p className="not-tradeable-text">Not Tradeable</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredItems.length === 0 && (
          <div className="empty-state">
            <Package size={64} className="empty-icon" />
            <h3 className="empty-title">No items found</h3>
            <p className="empty-description">Try adjusting your search or filters.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Inventory
