// components/LiveTradeModal.tsx
import React, { useState, useEffect } from 'react';
import { liveTradeWS } from '../services/liveTradeWebSocket';
import type { TradeItem, LiveTrade } from '../services/liveTradeWebSocket';
import { Handshake, Send, Inbox, DollarSign, X, CheckCircle, Clock, Package } from 'lucide-react';
import { LiveTradeInventoryModal } from './LiveTradeInventoryModal';
import '../styles/LiveTradeModal.css';

interface LiveTradeModalProps {
    trade: LiveTrade;
    onClose: () => void;
}

export const LiveTradeModal: React.FC<LiveTradeModalProps> = ({ trade, onClose }) => {
    const [tradeState, setTradeState] = useState<LiveTrade>(trade);
    const [showInventoryModal, setShowInventoryModal] = useState(false);

    useEffect(() => {
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
                    <h2><Handshake size={24} style={{ display: 'inline', marginRight: '0.5rem' }} />Live Trade with {trade.partner.username}</h2>
                    <button onClick={handleCancel} className="close-btn"><X size={20} /></button>
                </div>

                <div className="live-trade-content">
                    {/* Your Offer Section */}
                    <div className="trade-offer-section your-offer">
                        <div className="section-header">
                            <h3><Send size={20} style={{ display: 'inline', marginRight: '0.5rem' }} />Your Offer</h3>
                            <span className="value-badge">
                                <DollarSign size={16} style={{ display: 'inline' }} /> {getTotalValue(tradeState.yourItems)}
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
                                            <div className="item-img placeholder"><Package size={32} /></div>
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
                                            <X size={16} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Add Item Controls */}
                        {!tradeState.yourConfirmed && (
                            <div className="add-item-section">
                                <button 
                                    className="open-inventory-btn"
                                    onClick={() => setShowInventoryModal(true)}
                                >
                                    <Package size={18} />
                                    Select Items from Inventory
                                </button>
                            </div>
                        )}

                        {/* Confirmation Status */}
                        <div className="confirmation-status">
                            {tradeState.yourConfirmed ? (
                                <div className="confirmed-badge"><CheckCircle size={16} /> You confirmed</div>
                            ) : (
                                <button
                                    onClick={handleConfirm}
                                    className="confirm-btn"
                                    disabled={tradeState.yourItems.length === 0}
                                >
                                    <CheckCircle size={16} /> Confirm Trade
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Partner's Offer Section */}
                    <div className="trade-offer-section partner-offer">
                        <div className="section-header">
                            <h3><Inbox size={20} style={{ display: 'inline', marginRight: '0.5rem' }} />{trade.partner.username}'s Offer</h3>
                            <span className="value-badge">
                                <DollarSign size={16} style={{ display: 'inline' }} /> {getTotalValue(tradeState.partnerItems)}
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
                                <div className="confirmed-badge"><CheckCircle size={16} /> {trade.partner.username} confirmed</div>
                            ) : (
                                <div className="waiting-badge"><Clock size={16} /> Waiting for confirmation...</div>
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

            {/* Inventory Selection Modal */}
            <LiveTradeInventoryModal
                isOpen={showInventoryModal}
                onClose={() => setShowInventoryModal(false)}
                onAddItem={(item, qty) => {
                    // Directly add the item without relying on state
                    if (item.Item) {
                        liveTradeWS.addItem(trade.id, item.Item.item_id, qty);
                    }
                    setShowInventoryModal(false);
                }}
            />
        </div>
    );
};
