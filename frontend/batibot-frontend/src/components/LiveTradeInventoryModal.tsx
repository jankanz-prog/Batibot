import React, { useState, useEffect } from 'react';
import { X, Search, Package } from 'lucide-react';
import { inventoryAPI } from '../services/itemsAPI';
import { useAuth } from '../context/AuthContext';
import type { InventoryItem } from '../types/items';
import '../styles/LiveTradeInventoryModal.css';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onAddItem: (item: InventoryItem, quantity: number) => void;
}

export const LiveTradeInventoryModal: React.FC<Props> = ({
    isOpen,
    onClose,
    onAddItem
}) => {
    const { token } = useAuth();
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        if (isOpen && token) {
            loadInventory();
            // Reset selection when modal opens
            setSelectedItem(null);
            setQuantity(1);
        }
    }, [isOpen, token]);

    const loadInventory = async () => {
        if (!token) return;
        
        try {
            setLoading(true);
            const response = await inventoryAPI.getInventory(token);
            if (response.success && response.data) {
                setInventory(response.data);
            }
        } catch (error) {
            console.error('Failed to load inventory:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredInventory = inventory.filter(invItem => {
        const item = invItem.Item;
        if (!item) return false;
        return item.name.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const getRarityClass = (rarityName?: string) => {
        if (!rarityName) return 'rarity-common';
        return `rarity-${rarityName.toLowerCase()}`;
    };

    if (!isOpen) return null;

    return (
        <div className="live-trade-inventory-overlay" onClick={onClose}>
            <div className="live-trade-inventory-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Select Item from Inventory</h3>
                    <button className="close-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className="modal-search">
                    <Search size={18} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search items..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>

                <div className="modal-content">
                    {loading ? (
                        <div className="loading-state">
                            <p>Loading inventory...</p>
                        </div>
                    ) : filteredInventory.length === 0 ? (
                        <div className="empty-state">
                            <Package size={48} />
                            <p>No items found</p>
                        </div>
                    ) : (
                        <div className="inventory-grid-mini">
                            {filteredInventory.map((invItem) => {
                                const item = invItem.Item;
                                if (!item) return null;

                                const isSelected = selectedItem?.inventory_id === invItem.inventory_id;

                                return (
                                    <div
                                        key={invItem.inventory_id}
                                        className={`inventory-item-mini ${getRarityClass(item.rarity?.name)} ${isSelected ? 'selected' : ''}`}
                                        onClick={() => {
                                            setSelectedItem(invItem);
                                            setQuantity(1);
                                        }}
                                    >
                                        <div className="item-image-mini">
                                            <Package size={32} />
                                        </div>
                                        <div className="item-info-mini">
                                            <div className="item-name-mini">{item.name}</div>
                                            <div className="item-rarity-mini">{item.rarity?.name}</div>
                                            {invItem.quantity > 1 && (
                                                <div className="item-quantity-mini">x{invItem.quantity}</div>
                                            )}
                                        </div>
                                        {isSelected && (
                                            <div className="selected-indicator">✓</div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="modal-footer">
                    {selectedItem ? (
                        <>
                            <div className="quantity-selector">
                                <label>Quantity:</label>
                                <input
                                    type="number"
                                    min="1"
                                    max={selectedItem.quantity}
                                    value={quantity}
                                    onChange={(e) => setQuantity(Math.min(Math.max(1, parseInt(e.target.value) || 1), selectedItem.quantity))}
                                    className="quantity-input-mini"
                                />
                                <span className="max-quantity">/ {selectedItem.quantity}</span>
                            </div>
                            <button 
                                className="add-item-btn-mini" 
                                onClick={() => {
                                    onAddItem(selectedItem, quantity);
                                    setSelectedItem(null);
                                    setQuantity(1);
                                }}
                            >
                                Add to Trade
                            </button>
                        </>
                    ) : (
                        <p className="selection-hint">Select an item to add to trade</p>
                    )}
                </div>
            </div>
        </div>
    );
};
