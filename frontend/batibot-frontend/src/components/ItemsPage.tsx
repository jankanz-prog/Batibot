// components/ItemsPage.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { itemsAPI, raritiesAPI, categoriesAPI } from '../services/itemsAPI';
import type { Item, ItemRarity, ItemCategory } from '../types/items';
import { ItemModal } from './ItemModal';

export const ItemsPage: React.FC = () => {
    const { token, isAdmin } = useAuth();
    const [items, setItems] = useState<Item[]>([]);
    const [rarities, setRarities] = useState<ItemRarity[]>([]);
    const [categories, setCategories] = useState<ItemCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState<Item | null>(null);

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
                <h1 className="items-title">Items Database</h1>
                {isAdmin && (
                    <div className="admin-controls">
                        <button onClick={handleCreateItem} className="admin-btn">
                            ➕ Create Item
                        </button>
                        <button onClick={loadData} className="admin-btn">
                            🔄 Refresh
                        </button>
                    </div>
                )}
            </div>

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            {items.length === 0 ? (
                <div className="empty-state">
                    <h3>No items found</h3>
                    <p>Items will appear here once they are created.</p>
                </div>
            ) : (
                <div className="items-grid">
                    {items.map((item) => (
                        <div 
                            key={item.item_id} 
                            className={`item-card ${getRarityClass(item.rarity?.name)}`}
                            style={{ '--rarity-color': item.rarity?.color } as React.CSSProperties}
                        >
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
                    ))}
                </div>
            )}

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
