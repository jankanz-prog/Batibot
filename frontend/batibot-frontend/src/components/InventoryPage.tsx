// components/InventoryPage.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { inventoryAPI } from '../services/itemsAPI';
import type { InventoryItem } from '../types/items';

export const InventoryPage: React.FC = () => {
    const { token } = useAuth();
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
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
            const response = await inventoryAPI.getInventory(token);
            
            if (response.success && response.data) {
                setInventory(response.data);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load inventory');
        } finally {
            setLoading(false);
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
                <button onClick={loadInventory} className="admin-btn">
                    🔄 Refresh
                </button>
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

            {inventory.length === 0 ? (
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
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
