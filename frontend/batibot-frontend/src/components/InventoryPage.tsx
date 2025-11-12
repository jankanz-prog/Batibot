// components/InventoryPage.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { inventoryAPI } from '../services/itemsAPI';
import type { InventoryItem } from '../types/items';
import { Search, SlidersHorizontal, Package, Trash2, RotateCcw, RefreshCw, ChevronLeft, ChevronRight, Gamepad2 } from 'lucide-react';
import '../styles/inventory-stats.css';

export const InventoryPage: React.FC = () => {
    const { token } = useAuth();
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [deletedItems, setDeletedItems] = useState<InventoryItem[]>([]);
    const [showDeleted, setShowDeleted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // Multi-select state
    const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
    
    // Filter state
    const [searchTerm, setSearchTerm] = useState('');
    const [rarityFilter, setRarityFilter] = useState<string>('all');
    const [sortBy, setSortBy] = useState<'name' | 'rarity' | 'quantity' | 'date'>('date');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [showFilters, setShowFilters] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const ITEMS_PER_PAGE = 9; // 3x3 grid

    useEffect(() => {
        loadInventory();
    }, []);

    const loadInventory = async () => {
        if (!token) return;

        try {
            setLoading(true);
            setError(null);
            const [inventoryResponse, deletedResponse] = await Promise.all([
                inventoryAPI.getInventory(token),
                inventoryAPI.getDeletedItems(token)
            ]);
            
            if (inventoryResponse.success && inventoryResponse.data) {
                setInventory(inventoryResponse.data);
            }
            
            if (deletedResponse.success && deletedResponse.data) {
                setDeletedItems(deletedResponse.data);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load inventory');
        } finally {
            setLoading(false);
        }
    };

    const handleSoftDelete = async (item_id: number) => {
        if (!token) return;

        try {
            const response = await inventoryAPI.softDeleteItem(item_id, token);
            if (response.success) {
                await loadInventory(); // Reload both lists
            } else {
                // Show error message from backend
                setError(response.message || 'Failed to delete item');
                // Auto-clear error after 5 seconds
                setTimeout(() => setError(null), 5000);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete item');
            setTimeout(() => setError(null), 5000);
        }
    };

    const handleRestore = async (item_id: number) => {
        if (!token) return;

        try {
            const response = await inventoryAPI.restoreItem(item_id, token);
            if (response.success) {
                await loadInventory(); // Reload both lists
            } else {
                // Show error message from backend (e.g., "Cannot restore item. Inventory limit of 30 items reached")
                setError(response.message || 'Failed to restore item');
                // Auto-clear error after 5 seconds
                setTimeout(() => setError(null), 5000);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to restore item');
            setTimeout(() => setError(null), 5000);
        }
    };

    const handlePermanentDelete = async (item_id: number, item_name: string) => {
        if (!token) return;

        // Confirm before permanent deletion
        const confirmed = window.confirm(
            `⚠️ PERMANENT DELETE\n\nAre you sure you want to permanently delete "${item_name}"?\n\nThis action cannot be undone and the item will be completely removed from the database.`
        );

        if (!confirmed) return;

        try {
            const response = await inventoryAPI.permanentlyDeleteItem(item_id, token);
            if (response.success) {
                await loadInventory(); // Reload both lists
            } else {
                setError(response.message || 'Failed to permanently delete item');
                setTimeout(() => setError(null), 5000);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to permanently delete item');
            setTimeout(() => setError(null), 5000);
        }
    };

    // Multi-select handlers
    const handleSelectItem = (item_id: number) => {
        const newSelected = new Set(selectedItems);
        if (newSelected.has(item_id)) {
            newSelected.delete(item_id);
        } else {
            newSelected.add(item_id);
        }
        setSelectedItems(newSelected);
    };

    const handleSelectAll = () => {
        const currentList = showDeleted ? deletedItems : inventory;
        if (selectedItems.size === currentList.length) {
            setSelectedItems(new Set());
        } else {
            setSelectedItems(new Set(currentList.map(item => item.Item!.item_id)));
        }
    };

    const handleBulkDelete = async () => {
        if (!token || selectedItems.size === 0) return;

        const confirmed = window.confirm(
            `Are you sure you want to delete ${selectedItems.size} item(s)? They will be moved to deleted items.`
        );

        if (!confirmed) return;

        try {
            for (const item_id of selectedItems) {
                await inventoryAPI.softDeleteItem(item_id, token);
            }
            setSelectedItems(new Set());
            await loadInventory();
        } catch (err) {
            setError('Failed to delete some items');
            setTimeout(() => setError(null), 5000);
        }
    };

    const handleBulkPermanentDelete = async () => {
        if (!token || selectedItems.size === 0) return;

        const confirmed = window.confirm(
            `⚠️ PERMANENT DELETE\n\nAre you sure you want to PERMANENTLY delete ${selectedItems.size} item(s)?\n\nThis action cannot be undone!`
        );

        if (!confirmed) return;

        try {
            for (const item_id of selectedItems) {
                await inventoryAPI.permanentlyDeleteItem(item_id, token);
            }
            setSelectedItems(new Set());
            await loadInventory();
        } catch (err) {
            setError('Failed to permanently delete some items');
            setTimeout(() => setError(null), 5000);
        }
    };

    const getTotalItems = () => {
        return inventory.reduce((total, item) => total + item.quantity, 0);
    };

    const getUniqueItems = () => {
        return inventory.length;
    };

    const getRarityClass = (rarityName?: string) => {
        if (!rarityName) return 'rarity-common';
        return `rarity-${rarityName.toLowerCase()}`;
    };

    // Filtered and sorted items
    const filteredAndSortedItems = useMemo(() => {
        const currentList = showDeleted ? deletedItems : inventory;
        
        let filtered = currentList.filter(invItem => {
            const item = invItem.Item;
            if (!item) return false;

            // Search filter
            if (searchTerm && !item.name.toLowerCase().includes(searchTerm.toLowerCase())) {
                return false;
            }

            // Rarity filter
            if (rarityFilter !== 'all' && item.rarity?.name.toLowerCase() !== rarityFilter.toLowerCase()) {
                return false;
            }

            return true;
        });

        // Sort
        filtered.sort((a, b) => {
            let comparison = 0;
            
            switch (sortBy) {
                case 'name':
                    comparison = (a.Item?.name || '').localeCompare(b.Item?.name || '');
                    break;
                case 'rarity':
                    const rarityOrder: any = { common: 1, uncommon: 2, rare: 3, epic: 4, legendary: 5, mythical: 6 };
                    comparison = (rarityOrder[a.Item?.rarity?.name.toLowerCase() || 'common'] || 0) - 
                                (rarityOrder[b.Item?.rarity?.name.toLowerCase() || 'common'] || 0);
                    break;
                case 'quantity':
                    comparison = a.quantity - b.quantity;
                    break;
                case 'date':
                    comparison = new Date(a.acquired_at).getTime() - new Date(b.acquired_at).getTime();
                    break;
            }

            return sortOrder === 'asc' ? comparison : -comparison;
        });

        return filtered;
    }, [inventory, deletedItems, showDeleted, searchTerm, rarityFilter, sortBy, sortOrder]);

    // Get unique rarities for filter
    const availableRarities = useMemo(() => {
        const rarities = new Set<string>();
        [...inventory, ...deletedItems].forEach(invItem => {
            if (invItem.Item?.rarity?.name) {
                rarities.add(invItem.Item.rarity.name);
            }
        });
        return Array.from(rarities).sort();
    }, [inventory, deletedItems]);

    if (loading) {
        return (
            <div className="inventory-page">
                <div className="loading-spinner">
                    <div className="spinner"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="inventory-page">
            <div className="inventory-header">
                <div className="header-left">
                    <h1 className="items-title">My Inventory</h1>
                    <p className="items-subtitle"><Gamepad2 size={20} style={{ display: 'inline', marginBottom: '-4px' }} /> Manage your collected items</p>
                </div>
                <div className="header-actions">
                    <button 
                        onClick={() => {
                            setShowDeleted(!showDeleted);
                            setSelectedItems(new Set());
                            setCurrentPage(0);
                        }} 
                        className={`filter-btn ${!showDeleted ? 'active' : ''}`}
                    >
                        <Package size={16} /> Active ({inventory.length})
                    </button>
                    <button 
                        onClick={() => {
                            setShowDeleted(!showDeleted);
                            setSelectedItems(new Set());
                            setCurrentPage(0);
                        }} 
                        className={`filter-btn ${showDeleted ? 'active' : ''}`}
                    >
                        <Trash2 size={16} /> Deleted ({deletedItems.length})
                    </button>
                    <button onClick={loadInventory} className="admin-btn">
                        <RefreshCw size={16} /> Refresh
                    </button>
                </div>
            </div>

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            <div className="inventory-stats">
                <div className="stat-card compact">
                    <div className="stat-number">{getTotalItems()}</div>
                    <div className="stat-label">Total</div>
                </div>
                <div className="stat-card compact">
                    <div className="stat-number">{getUniqueItems()}</div>
                    <div className="stat-label">Unique</div>
                </div>
                <div className="stat-card compact">
                    <div className="stat-number">{30 - getUniqueItems()}</div>
                    <div className="stat-label">Free Slots</div>
                </div>
            </div>

            {/* Search Bar and Filter Toggle */}
            <div className="search-filter-bar">
                <div className="search-input-wrapper">
                    <Search size={20} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search items by name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input-main"
                    />
                </div>
                <button 
                    onClick={() => setShowFilters(!showFilters)}
                    className={`filter-toggle-btn ${showFilters ? 'active' : ''}`}
                >
                    <SlidersHorizontal size={18} />
                    {showFilters ? 'Close Filters' : 'Sort & Filter'}
                </button>
            </div>

            <div className="inventory-content-wrapper">
                {/* Filters Sidebar - Collapsible */}
                {showFilters && (
                <aside className="filters-sidebar">
                    <div className="filters-header">
                        <h3>Sort & Filter Options</h3>
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
                            {availableRarities.map(rarity => (
                                <option key={rarity} value={rarity}>{rarity}</option>
                            ))}
                        </select>
                    </div>

                    {/* Sort By */}
                    <div className="filter-group">
                        <label>Sort By</label>
                        <select 
                            value={sortBy} 
                            onChange={(e) => setSortBy(e.target.value as any)}
                            className="filter-select"
                        >
                            <option value="date">Date Acquired</option>
                            <option value="name">Name</option>
                            <option value="rarity">Rarity</option>
                            <option value="quantity">Quantity</option>
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
                            <option value="desc">Descending</option>
                            <option value="asc">Ascending</option>
                        </select>
                    </div>

                    <div className="filter-divider"></div>

                    {/* Multi-select actions */}
                    <div className="filter-group">
                        <label>Multi-Select ({selectedItems.size})</label>
                        <button 
                            onClick={handleSelectAll}
                            className="filter-action-btn"
                        >
                            {selectedItems.size === (showDeleted ? deletedItems : inventory).length ? '☐' : '☑'} Select All
                        </button>
                        
                        {selectedItems.size > 0 && (
                            <>
                                {!showDeleted ? (
                                    <button 
                                        onClick={handleBulkDelete}
                                        className="filter-action-btn danger"
                                        style={{ marginTop: '0.5rem' }}
                                    >
                                        <Trash2 size={16} /> Delete Selected
                                    </button>
                                ) : (
                                    <button 
                                        onClick={handleBulkPermanentDelete}
                                        className="filter-action-btn danger"
                                        style={{ marginTop: '0.5rem' }}
                                    >
                                        <Trash2 size={16} /> Permanent Delete
                                    </button>
                                )}
                            </>
                        )}
                    </div>

                    <div className="filter-info">
                        <small>💡 Showing {filteredAndSortedItems.length} of {(showDeleted ? deletedItems : inventory).length} items</small>
                    </div>
                </aside>
                )}

                {/* Main Content */}
                <div className="inventory-main-content">

            {filteredAndSortedItems.length === 0 ? (
                <div className="empty-state">
                    <h3>{showDeleted ? 'No deleted items' : 'No items found'}</h3>
                    <p>{showDeleted ? 'Items you delete will appear here.' : 'Try adjusting your filters or acquire new items.'}</p>
                </div>
            ) : (
                <>
                <div className="inventory-grid">
                    {filteredAndSortedItems.slice(currentPage * ITEMS_PER_PAGE, (currentPage + 1) * ITEMS_PER_PAGE).map((inventoryItem) => {
                            const item = inventoryItem.Item;
                            if (!item) return null;

                            const isSelected = selectedItems.has(item.item_id);
                            
                            return (
                                <div 
                                    key={inventoryItem.inventory_id} 
                                    className={`inventory-item ${getRarityClass(item.rarity?.name)} ${showDeleted ? 'deleted-item' : ''} ${isSelected ? 'selected' : ''}`}
                                    style={{ '--rarity-color': item.rarity?.color } as React.CSSProperties}
                                >
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
                                    <div className="quantity-badge">×{inventoryItem.quantity}</div>
                                    
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
                                    </div>

                                    <div className="item-actions">
                                        {showDeleted ? (
                                            <>
                                                <button 
                                                    onClick={() => handleRestore(item.item_id)}
                                                    className="restore-btn"
                                                >
                                                    <RotateCcw size={16} /> Restore
                                                </button>
                                                <button 
                                                    onClick={() => handlePermanentDelete(item.item_id, item.name)}
                                                    className="permanent-delete-btn"
                                                    style={{ marginLeft: '8px' }}
                                                >
                                                    <Trash2 size={16} /> Delete Forever
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                {item.is_tradeable && (
                                                    <span className="tradeable-badge">Tradeable</span>
                                                )}
                                                <button 
                                                    onClick={() => handleSoftDelete(item.item_id)}
                                                    className="delete-btn"
                                                >
                                                    <Trash2 size={16} /> Delete
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    
                    {/* Pagination Controls */}
                    {filteredAndSortedItems.length > ITEMS_PER_PAGE && (
                        <div className="pagination-controls">
                            <button 
                                onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                                disabled={currentPage === 0}
                                className="pagination-btn"
                            >
                                <ChevronLeft size={20} /> Previous
                            </button>
                            <span className="pagination-info">
                                Page {currentPage + 1} of {Math.ceil(filteredAndSortedItems.length / ITEMS_PER_PAGE)}
                                <span className="pagination-items"> ({filteredAndSortedItems.slice(currentPage * ITEMS_PER_PAGE, (currentPage + 1) * ITEMS_PER_PAGE).length} items)</span>
                            </span>
                            <button 
                                onClick={() => setCurrentPage(prev => Math.min(Math.ceil(filteredAndSortedItems.length / ITEMS_PER_PAGE) - 1, prev + 1))}
                                disabled={currentPage >= Math.ceil(filteredAndSortedItems.length / ITEMS_PER_PAGE) - 1}
                                className="pagination-btn"
                            >
                                Next <ChevronRight size={20} />
                            </button>
                        </div>
                    )}
                </>
            )}
                </div>
            </div>
        </div>
    );
};
