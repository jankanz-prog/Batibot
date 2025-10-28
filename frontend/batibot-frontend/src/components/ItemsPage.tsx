// components/ItemsPage.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { itemsAPI, raritiesAPI, categoriesAPI, inventoryAPI } from '../services/itemsAPI';
import type { Item, ItemRarity, ItemCategory, InventoryItem } from '../types/items';
import { ItemModal } from './ItemModal';

export const ItemsPage: React.FC = () => {
    const { token, isAdmin } = useAuth();
    const [items, setItems] = useState<Item[]>([]);
    const [rarities, setRarities] = useState<ItemRarity[]>([]);
    const [categories, setCategories] = useState<ItemCategory[]>([]);
    const [userInventory, setUserInventory] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState<Item | null>(null);
    
    // Multi-select state (admin only)
    const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
    
    // Filter state
    const [searchTerm, setSearchTerm] = useState('');
    const [rarityFilter, setRarityFilter] = useState<string>('all');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [tradeableFilter, setTradeableFilter] = useState<string>('all');
    const [ownershipFilter, setOwnershipFilter] = useState<string>('all');
    const [sortBy, setSortBy] = useState<'name' | 'rarity' | 'category'>('name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const [itemsResponse, raritiesResponse, categoriesResponse] = await Promise.all([
                itemsAPI.getAllItems(),
                raritiesAPI.getAllRarities(),
                categoriesAPI.getAllCategories()
            ]);

            if (itemsResponse.success && itemsResponse.data) {
                setItems(itemsResponse.data);
            }
            if (raritiesResponse.success && raritiesResponse.data) {
                setRarities(raritiesResponse.data);
            }
            if (categoriesResponse.success && categoriesResponse.data) {
                setCategories(categoriesResponse.data);
            }
            
            // Load user inventory if logged in
            if (token) {
                const inventoryResponse = await inventoryAPI.getInventory(token);
                if (inventoryResponse.success && inventoryResponse.data) {
                    setUserInventory(inventoryResponse.data);
                }
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateItem = () => {
        setEditingItem(null);
        setShowModal(true);
    };

    const handleEditItem = (item: Item) => {
        setEditingItem(item);
        setShowModal(true);
    };

    const handleDeleteItem = async (item: Item) => {
        if (!token || !isAdmin) return;
        
        if (!confirm(`Are you sure you want to delete "${item.name}"?`)) return;

        try {
            await itemsAPI.deleteItem(item.item_id, token);
            await loadData(); // Refresh the list
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete item');
        }
    };

    const handleModalClose = () => {
        setShowModal(false);
        setEditingItem(null);
    };

    const handleModalSuccess = () => {
        setShowModal(false);
        setEditingItem(null);
        loadData(); // Refresh the list
    };

    const getRarityClass = (rarityName?: string) => {
        if (!rarityName) return 'rarity-common';
        return `rarity-${rarityName.toLowerCase()}`;
    };

    // Multi-select handlers (admin only)
    const handleSelectItem = (item_id: number) => {
        if (!isAdmin) return;
        const newSelected = new Set(selectedItems);
        if (newSelected.has(item_id)) {
            newSelected.delete(item_id);
        } else {
            newSelected.add(item_id);
        }
        setSelectedItems(newSelected);
    };

    const handleSelectAll = () => {
        if (!isAdmin) return;
        if (selectedItems.size === filteredAndSortedItems.length) {
            setSelectedItems(new Set());
        } else {
            setSelectedItems(new Set(filteredAndSortedItems.map(item => item.item_id)));
        }
    };

    const handleBulkDelete = async () => {
        if (!token || !isAdmin || selectedItems.size === 0) return;

        const confirmed = window.confirm(
            `Are you sure you want to delete ${selectedItems.size} item(s)? This action cannot be undone.`
        );

        if (!confirmed) return;

        try {
            for (const item_id of selectedItems) {
                await itemsAPI.deleteItem(item_id, token);
            }
            setSelectedItems(new Set());
            await loadData();
        } catch (err) {
            setError('Failed to delete some items');
            setTimeout(() => setError(null), 5000);
        }
    };

    // Check if user owns an item
    const userOwnsItem = (itemId: number): boolean => {
        return userInventory.some(invItem => invItem.Item?.item_id === itemId);
    };

    // Filtered and sorted items
    const filteredAndSortedItems = useMemo(() => {
        let filtered = items.filter(item => {
            // Search filter
            if (searchTerm && !item.name.toLowerCase().includes(searchTerm.toLowerCase())) {
                return false;
            }

            // Rarity filter
            if (rarityFilter !== 'all' && item.rarity?.name.toLowerCase() !== rarityFilter.toLowerCase()) {
                return false;
            }

            // Category filter
            if (categoryFilter !== 'all' && item.category?.name !== categoryFilter) {
                return false;
            }

            // Tradeable filter
            if (tradeableFilter === 'tradeable' && !item.is_tradeable) {
                return false;
            }
            if (tradeableFilter === 'bound' && item.is_tradeable) {
                return false;
            }

            // Ownership filter
            if (ownershipFilter === 'owned' && !userOwnsItem(item.item_id)) {
                return false;
            }
            if (ownershipFilter === 'not_owned' && userOwnsItem(item.item_id)) {
                return false;
            }

            return true;
        });

        // Sort
        filtered.sort((a, b) => {
            let comparison = 0;
            
            switch (sortBy) {
                case 'name':
                    comparison = a.name.localeCompare(b.name);
                    break;
                case 'rarity':
                    const rarityOrder: any = { common: 1, uncommon: 2, rare: 3, epic: 4, legendary: 5, mythical: 6 };
                    comparison = (rarityOrder[a.rarity?.name.toLowerCase() || 'common'] || 0) - 
                                (rarityOrder[b.rarity?.name.toLowerCase() || 'common'] || 0);
                    break;
                case 'category':
                    comparison = (a.category?.name || '').localeCompare(b.category?.name || '');
                    break;
            }

            return sortOrder === 'asc' ? comparison : -comparison;
        });

        return filtered;
    }, [items, searchTerm, rarityFilter, categoryFilter, tradeableFilter, ownershipFilter, sortBy, sortOrder, userInventory]);

    if (loading) {
        return (
            <div className="items-page">
                <div className="loading-spinner">
                    <div className="spinner"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="items-page">
            <div className="items-header">
                <div className="header-left">
                    <h1 className="items-title">Items Database</h1>
                    <p className="items-subtitle">📚 Browse all available items</p>
                </div>
                <div className="header-actions">
                    {isAdmin && (
                        <button onClick={handleCreateItem} className="admin-btn">
                            ➕ Create Item
                        </button>
                    )}
                    <button onClick={loadData} className="admin-btn">
                        🔄 Refresh
                    </button>
                </div>
            </div>

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            <div className="inventory-content-wrapper">
                {/* Filters Sidebar */}
                <aside className="filters-sidebar">
                    <div className="filters-header">
                        <h3>🔍 Filters</h3>
                    </div>

                    {/* Search */}
                    <div className="filter-group">
                        <label>Search Items</label>
                        <input
                            type="text"
                            placeholder="Search by name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="filter-input"
                        />
                    </div>

                    {/* Rarity Filter */}
                    <div className="filter-group">
                        <label>Rarity</label>
                        <select 
                            value={rarityFilter} 
                            onChange={(e) => setRarityFilter(e.target.value)}
                            className="filter-select"
                        >
                            <option value="all">All Rarities</option>
                            {rarities.map(rarity => (
                                <option key={rarity.rarity_id} value={rarity.name}>{rarity.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Category Filter */}
                    <div className="filter-group">
                        <label>Category</label>
                        <select 
                            value={categoryFilter} 
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="filter-select"
                        >
                            <option value="all">All Categories</option>
                            {categories.map(cat => (
                                <option key={cat.category_id} value={cat.name}>
                                    {cat.icon} {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Tradeable Filter */}
                    <div className="filter-group">
                        <label>Tradeable Status</label>
                        <select 
                            value={tradeableFilter} 
                            onChange={(e) => setTradeableFilter(e.target.value)}
                            className="filter-select"
                        >
                            <option value="all">All Items</option>
                            <option value="tradeable">Tradeable Only</option>
                            <option value="bound">Bound Only</option>
                        </select>
                    </div>

                    {/* Ownership Filter */}
                    {token && (
                        <div className="filter-group">
                            <label>Ownership</label>
                            <select 
                                value={ownershipFilter} 
                                onChange={(e) => setOwnershipFilter(e.target.value)}
                                className="filter-select"
                            >
                                <option value="all">All Items</option>
                                <option value="owned">🎖️ Items I Own</option>
                                <option value="not_owned">🔒 Items I Don't Own</option>
                            </select>
                        </div>
                    )}

                    {/* Sort By */}
                    <div className="filter-group">
                        <label>Sort By</label>
                        <select 
                            value={sortBy} 
                            onChange={(e) => setSortBy(e.target.value as any)}
                            className="filter-select"
                        >
                            <option value="name">Name</option>
                            <option value="rarity">Rarity</option>
                            <option value="category">Category</option>
                        </select>
                    </div>

                    {/* Sort Order */}
                    <div className="filter-group">
                        <label>Order</label>
                        <select 
                            value={sortOrder} 
                            onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                            className="filter-select"
                        >
                            <option value="asc">Ascending</option>
                            <option value="desc">Descending</option>
                        </select>
                    </div>

                    {isAdmin && (
                        <>
                            <div className="filter-divider"></div>

                            {/* Multi-select actions (Admin only) */}
                            <div className="filter-group">
                                <label>Multi-Select ({selectedItems.size})</label>
                                <button 
                                    onClick={handleSelectAll}
                                    className="filter-action-btn"
                                >
                                    {selectedItems.size === filteredAndSortedItems.length ? '☐' : '☑'} Select All
                                </button>
                                
                                {selectedItems.size > 0 && (
                                    <button 
                                        onClick={handleBulkDelete}
                                        className="filter-action-btn danger"
                                        style={{ marginTop: '0.5rem' }}
                                    >
                                        🗑️ Delete Selected
                                    </button>
                                )}
                            </div>
                        </>
                    )}

                    <div className="filter-info">
                        <small>💡 Showing {filteredAndSortedItems.length} of {items.length} items</small>
                    </div>
                </aside>

                {/* Main Content */}
                <div className="inventory-main-content">

            {filteredAndSortedItems.length === 0 ? (
                <div className="empty-state">
                    <h3>No items found</h3>
                    <p>Try adjusting your filters or create new items.</p>
                </div>
            ) : (
                <div className="items-grid">
                    {filteredAndSortedItems.map((item) => {
                        const isSelected = selectedItems.has(item.item_id);
                        const isOwned = userOwnsItem(item.item_id);
                        
                        return (
                        <div 
                            key={item.item_id} 
                            className={`item-card ${getRarityClass(item.rarity?.name)} ${isSelected ? 'selected' : ''}`}
                            style={{ '--rarity-color': item.rarity?.color } as React.CSSProperties}
                        >
                            {isAdmin && (
                                <div 
                                    className="item-checkbox"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleSelectItem(item.item_id);
                                    }}
                                >
                                    <input 
                                        type="checkbox" 
                                        checked={isSelected}
                                        onChange={() => {}}
                                    />
                                </div>
                            )}
                            {isOwned && (
                                <div className="owned-badge" title="You own this item">
                                    🎖️
                                </div>
                            )}
                            <div className="item-header">
                                <div className="item-info">
                                    <h3 className="item-name">{item.name}</h3>
                                    <div className="item-category">
                                        {item.category?.icon && <span>{item.category.icon}</span>}
                                        {item.category?.name}
                                    </div>
                                </div>
                                {item.image_url ? (
                                    <img 
                                        src={item.image_url} 
                                        alt={item.name}
                                        className="item-image"
                                    />
                                ) : (
                                    <div className="item-image">
                                        No Image
                                    </div>
                                )}
                            </div>

                            {item.description && (
                                <p className="item-description">{item.description}</p>
                            )}

                            <div className="item-footer">
                                <div className="item-rarity" style={{ color: item.rarity?.color }}>
                                    <div 
                                        className="rarity-dot"
                                        style={{ background: item.rarity?.color }}
                                    ></div>
                                    {item.rarity?.name}
                                </div>
                                
                                <div className="item-actions">
                                    {item.is_tradeable ? (
                                        <span className="tradeable-badge">Tradeable</span>
                                    ) : (
                                        <span className="non-tradeable-badge">Bound</span>
                                    )}
                                    
                                    {isAdmin && (
                                        <>
                                            <button 
                                                onClick={() => handleEditItem(item)}
                                                className="item-btn edit"
                                                title="Edit Item"
                                            >
                                                ✏️
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteItem(item)}
                                                className="item-btn delete"
                                                title="Delete Item"
                                            >
                                                🗑️
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                        );
                    })}
                </div>
            )}
                </div>
            </div>

            {showModal && (
                <ItemModal
                    item={editingItem}
                    rarities={rarities}
                    categories={categories}
                    onClose={handleModalClose}
                    onSuccess={handleModalSuccess}
                />
            )}
        </div>
    );
};
