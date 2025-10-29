// components/LiveTradeModal.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { inventoryAPI } from '../services/itemsAPI';
import type { InventoryItem } from '../types/items';
import { liveTradeWS } from '../services/liveTradeWebSocket';
import type { TradeItem, LiveTrade } from '../services/liveTradeWebSocket';
import '../styles/LiveTradeModal.css';

interface LiveTradeModalProps {
    trade: LiveTrade;
    onClose: () => void;
}

export const LiveTradeModal: React.FC<LiveTradeModalProps> = ({ trade, onClose }) => {
    const { token } = useAuth();
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [tradeState, setTradeState] = useState<LiveTrade>(trade);

    useEffect(() => {
        loadInventory();
        setupTradeListeners();

        return () => {
            liveTradeWS.off('trade_update', handleTradeUpdate);
            liveTradeWS.off('trade_completed', handleTradeCompleted);
            liveTradeWS.off('trade_cancelled', handleTradeCancelled);
            liveTradeWS.off('trade_failed', handleTradeFailed);
        };
    }, []);

    const setupTradeListeners = () => {
        liveTradeWS.on('trade_update', handleTradeUpdate);
        liveTradeWS.on('trade_completed', handleTradeCompleted);
        liveTradeWS.on('trade_cancelled', handleTradeCancelled);
        liveTradeWS.on('trade_failed', handleTradeFailed);
    };

    const handleTradeUpdate = (data: any) => {
        setTradeState(prev => ({
            ...prev,
            yourItems: data.trade.yourItems,
            partnerItems: data.trade.partnerItems,
            yourConfirmed: data.trade.yourConfirmed,
            partnerConfirmed: data.trade.partnerConfirmed
        }));
    };

    const handleTradeCompleted = (data: any) => {
        alert('✅ ' + data.message);
        onClose();
    };

    const handleTradeCancelled = (data: any) => {
        alert('❌ ' + data.message);
        onClose();
    };

    const handleTradeFailed = (data: any) => {
        alert('❌ Trade failed: ' + data.message);
    };

    const loadInventory = async () => {
        if (!token) return;

        try {
            setLoading(true);
            const response = await inventoryAPI.getInventory(token);
            if (response.success && response.data) {
                setInventory(response.data.filter(item => item.Item?.is_tradeable));
            }
        } catch (err) {
            console.error('Failed to load inventory:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddItem = () => {
        if (!selectedItem || quantity <= 0) return;

        liveTradeWS.addItem(trade.id, selectedItem.Item!.item_id, quantity);
        setSelectedItem(null);
        setQuantity(1);
    };

    const handleRemoveItem = (itemId: number) => {
        liveTradeWS.removeItem(trade.id, itemId);
    };

    const handleConfirm = () => {
        liveTradeWS.confirmTrade(trade.id);
    };

    const handleCancel = () => {
        if (window.confirm('Are you sure you want to cancel this trade?')) {
            liveTradeWS.cancelTrade(trade.id);
            onClose();
        }
    };

    const getTotalValue = (items: TradeItem[]) => {
        // This is a placeholder - you'd need to fetch item values
        return items.reduce((sum, item) => sum + (item.quantity * 100), 0);
    };

    return (
        <div className="live-trade-modal-overlay" onClick={handleCancel}>
            <div className="live-trade-modal" onClick={(e) => e.stopPropagation()}>
                <div className="live-trade-header">
                    <h2>🤝 Live Trade with {trade.partner.username}</h2>
                    <button onClick={handleCancel} className="close-btn">✕</button>
                </div>

                <div className="live-trade-content">
                    {/* Your Offer Section */}
                    <div className="trade-offer-section your-offer">
                        <div className="section-header">
                            <h3>📤 Your Offer</h3>
                            <span className="value-badge">
                                💰 {getTotalValue(tradeState.yourItems)}
                            </span>
                        </div>

                        <div className="trade-items-grid">
                            {tradeState.yourItems.length === 0 ? (
                                <div className="empty-items">
                                    <p>Add items to your offer</p>
                                </div>
                            ) : (
                                tradeState.yourItems.map((item) => (
                                    <div key={item.item_id} className="trade-item-card">
                                        {item.image_url ? (
                                            <img src={item.image_url} alt={item.name} className="item-img" />
                                        ) : (
                                            <div className="item-img placeholder">📦</div>
                                        )}
                                        <div className="item-info">
                                            <p className="item-name">{item.name}</p>
                                            <p className="item-quantity">×{item.quantity}</p>
                                        </div>
                                        <button
                                            onClick={() => handleRemoveItem(item.item_id)}
                                            className="remove-item-btn"
                                            disabled={tradeState.yourConfirmed}
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Add Item Controls */}
                        {!tradeState.yourConfirmed && (
                            <div className="add-item-section">
                                <select
                                    value={selectedItem?.inventory_id || ''}
                                    onChange={(e) => {
                                        const item = inventory.find(i => i.inventory_id === parseInt(e.target.value));
                                        setSelectedItem(item || null);
                                        setQuantity(1);
                                    }}
                                    className="item-select"
                                >
                                    <option value="">Select an item...</option>
                                    {inventory.map((item) => (
                                        <option key={item.inventory_id} value={item.inventory_id}>
                                            {item.Item?.name} (×{item.quantity})
                                        </option>
                                    ))}
                                </select>

                                {selectedItem && (
                                    <div className="quantity-input-group">
                                        <input
                                            type="number"
                                            min="1"
                                            max={selectedItem.quantity}
                                            value={quantity}
                                            onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                                            className="quantity-input"
                                        />
                                        <button onClick={handleAddItem} className="add-item-btn">
                                            ➕ Add
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Confirmation Status */}
                        <div className="confirmation-status">
                            {tradeState.yourConfirmed ? (
                                <div className="confirmed-badge">✅ You confirmed</div>
                            ) : (
                                <button
                                    onClick={handleConfirm}
                                    className="confirm-btn"
                                    disabled={tradeState.yourItems.length === 0}
                                >
                                    ✅ Confirm Trade
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Partner's Offer Section */}
                    <div className="trade-offer-section partner-offer">
                        <div className="section-header">
                            <h3>📥 {trade.partner.username}'s Offer</h3>
                            <span className="value-badge">
                                💰 {getTotalValue(tradeState.partnerItems)}
                            </span>
                        </div>

                        <div className="trade-items-grid">
                            {tradeState.partnerItems.length === 0 ? (
                                <div className="empty-items">
                                    <p>Waiting for {trade.partner.username}...</p>
                                </div>
                            ) : (
                                tradeState.partnerItems.map((item) => (
                                    <div key={item.item_id} className="trade-item-card">
                                        {item.image_url ? (
                                            <img src={item.image_url} alt={item.name} className="item-img" />
                                        ) : (
                                            <div className="item-img placeholder">📦</div>
                                        )}
                                        <div className="item-info">
                                            <p className="item-name">{item.name}</p>
                                            <p className="item-quantity">×{item.quantity}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Partner Confirmation Status */}
                        <div className="confirmation-status">
                            {tradeState.partnerConfirmed ? (
                                <div className="confirmed-badge">✅ {trade.partner.username} confirmed</div>
                            ) : (
                                <div className="waiting-badge">⏳ Waiting for confirmation...</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Trade will execute when both confirm */}
                {tradeState.yourConfirmed && tradeState.partnerConfirmed && (
                    <div className="executing-trade">
                        <p>🔄 Executing trade...</p>
                    </div>
                )}
            </div>
        </div>
    );
};
