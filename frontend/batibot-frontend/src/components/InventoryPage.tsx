// components/InventoryPage.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { inventoryAPI } from '../services/itemsAPI';
import type { InventoryItem } from '../types/items';

export const InventoryPage: React.FC = () => {
    const { token } = useAuth();
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [deletedItems, setDeletedItems] = useState<InventoryItem[]>([]);
    const [showDeleted, setShowDeleted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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
                <h1 className="items-title">My Inventory</h1>
                <div className="header-actions">
                    <button 
                        onClick={() => setShowDeleted(!showDeleted)} 
                        className="admin-btn"
                        style={{ marginRight: '10px' }}
                    >
                        {showDeleted ? '📦 Active Items' : '🗑️ Deleted Items'} ({showDeleted ? inventory.length : deletedItems.length})
                    </button>
                    <button onClick={loadInventory} className="admin-btn">
                        🔄 Refresh
                    </button>
                </div>
            </div>

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            <div className="inventory-stats">
                <div className="stat-card">
                    <div className="stat-number">{getTotalItems()}</div>
                    <div className="stat-label">Total Items</div>
                </div>
                <div className="stat-card">
                    <div className="stat-number">{getUniqueItems()}</div>
                    <div className="stat-label">Unique Items</div>
                </div>
                <div className="stat-card">
                    <div className="stat-number">{30 - getUniqueItems()}</div>
                    <div className="stat-label">Free Slots</div>
                </div>
            </div>

            {showDeleted ? (
                // Deleted Items View
                deletedItems.length === 0 ? (
                    <div className="empty-state">
                        <h3>No deleted items</h3>
                        <p>Items you delete will appear here and can be restored.</p>
                    </div>
                ) : (
                    <div className="inventory-grid">
                        {deletedItems.map((inventoryItem) => {
                            const item = inventoryItem.Item;
                            if (!item) return null;

                            return (
                                <div 
                                    key={inventoryItem.inventory_id} 
                                    className={`inventory-item ${getRarityClass(item.rarity?.name)} deleted-item`}
                                    style={{ '--rarity-color': item.rarity?.color } as React.CSSProperties}
                                >
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
                                        <button 
                                            onClick={() => handleRestore(item.item_id)}
                                            className="restore-btn"
                                        >
                                            ↩️ Restore
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )
            ) : (
                // Active Inventory View
                inventory.length === 0 ? (
                    <div className="empty-state">
                        <h3>Your inventory is empty</h3>
                        <p>Items you acquire will appear here.</p>
                    </div>
                ) : (
                    <div className="inventory-grid">
                        {inventory.map((inventoryItem) => {
                            const item = inventoryItem.Item;
                            if (!item) return null;

                            return (
                                <div 
                                    key={inventoryItem.inventory_id} 
                                    className={`inventory-item ${getRarityClass(item.rarity?.name)}`}
                                    style={{ '--rarity-color': item.rarity?.color } as React.CSSProperties}
                                >
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
                                        
                                        {item.is_tradeable ? (
                                            <span className="tradeable-badge">Tradeable</span>
                                        ) : (
                                            <span className="non-tradeable-badge">Bound</span>
                                        )}
                                    </div>

                                    <div className="item-meta">
                                        <small>Acquired: {new Date(inventoryItem.acquired_at).toLocaleDateString()}</small>
                                    </div>

                                    <div className="item-actions">
                                        <button 
                                            onClick={() => handleSoftDelete(item.item_id)}
                                            className="delete-btn"
                                        >
                                            🗑️ Delete
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )
            )}
        </div>
    );
};
