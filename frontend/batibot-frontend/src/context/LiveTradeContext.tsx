// context/LiveTradeContext.tsx
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { liveTradeWS } from '../services/liveTradeWebSocket';
import type { LiveTrade, TradeInvite } from '../services/liveTradeWebSocket';
import { LiveTradeInvitePopup } from '../components/LiveTradeInvitePopup';
import { LiveTradeModal } from '../components/LiveTradeModal';

interface LiveTradeContextType {
    activeTrade: LiveTrade | null;
    pendingInvite: TradeInvite | null;
    isConnected: boolean;
}

const LiveTradeContext = createContext<LiveTradeContextType | undefined>(undefined);

export const useLiveTrade = () => {
    const context = useContext(LiveTradeContext);
    if (!context) {
        throw new Error('useLiveTrade must be used within a LiveTradeProvider');
    }
    return context;
};

interface LiveTradeProviderProps {
    children: React.ReactNode;
}

export const LiveTradeProvider: React.FC<LiveTradeProviderProps> = ({ children }) => {
    const { token, user } = useAuth();
    const [isConnected, setIsConnected] = useState(false);
    const [pendingInvite, setPendingInvite] = useState<TradeInvite | null>(null);
    const [activeTrade, setActiveTrade] = useState<LiveTrade | null>(null);

    // Connect to live trade WebSocket
    useEffect(() => {
        if (token && user) {
            console.log('🤝 Connecting to live trade service...');
            liveTradeWS.connect(token);

            // Set up event listeners
            liveTradeWS.on('connection_success', handleConnectionSuccess);
            liveTradeWS.on('trade_invite_received', handleTradeInviteReceived);
            liveTradeWS.on('trade_invite_sent', handleTradeInviteSent);
            liveTradeWS.on('trade_started', handleTradeStarted);
            liveTradeWS.on('trade_declined', handleTradeDeclined);
            liveTradeWS.on('trade_completed', handleTradeCompleted);
            liveTradeWS.on('trade_cancelled', handleTradeCancelled);
            liveTradeWS.on('trade_failed', handleTradeFailed);

            return () => {
                liveTradeWS.off('connection_success', handleConnectionSuccess);
                liveTradeWS.off('trade_invite_received', handleTradeInviteReceived);
                liveTradeWS.off('trade_invite_sent', handleTradeInviteSent);
                liveTradeWS.off('trade_started', handleTradeStarted);
                liveTradeWS.off('trade_declined', handleTradeDeclined);
                liveTradeWS.off('trade_completed', handleTradeCompleted);
                liveTradeWS.off('trade_cancelled', handleTradeCancelled);
                liveTradeWS.off('trade_failed', handleTradeFailed);
                liveTradeWS.disconnect();
            };
        }
    }, [token, user]);

    const handleConnectionSuccess = useCallback(() => {
        console.log('✅ Live trade service connected');
        setIsConnected(true);
    }, []);

    const handleTradeInviteReceived = useCallback((data: any) => {
        console.log('📨 Trade invite received:', data);
        setPendingInvite({
            tradeId: data.tradeId,
            from: data.from
        });

        // Show browser notification
        if (Notification.permission === 'granted') {
            new Notification('Live Trade Request', {
                body: `${data.from.username} wants to trade with you`,
                icon: '/favicon.ico'
            });
        }
    }, []);

    const handleTradeInviteSent = useCallback((data: any) => {
        console.log('✅ Trade invite sent:', data);
    }, []);

    const handleTradeStarted = useCallback((data: any) => {
        console.log('🤝 Trade started:', data);
        setActiveTrade(data.trade);
        setPendingInvite(null);
    }, []);

    const handleTradeDeclined = useCallback((data: any) => {
        console.log('❌ Trade declined:', data.message);
        alert(data.message);
        setPendingInvite(null);
    }, []);

    const handleTradeCompleted = useCallback((data: any) => {
        console.log('✅ Trade completed:', data.message);
        setActiveTrade(null);
    }, []);

    const handleTradeCancelled = useCallback((data: any) => {
        console.log('❌ Trade cancelled:', data.message);
        setActiveTrade(null);
        setPendingInvite(null);
    }, []);

    const handleTradeFailed = useCallback((data: any) => {
        console.error('❌ Trade failed:', data.message);
        setActiveTrade(null);
    }, []);

    const handleAcceptInvite = useCallback(() => {
        if (pendingInvite) {
            liveTradeWS.acceptTrade(pendingInvite.tradeId);
        }
    }, [pendingInvite]);

    const handleDeclineInvite = useCallback(() => {
        if (pendingInvite) {
            liveTradeWS.declineTrade(pendingInvite.tradeId);
            setPendingInvite(null);
        }
    }, [pendingInvite]);

    const handleCloseTrade = useCallback(() => {
        setActiveTrade(null);
    }, []);

    return (
        <LiveTradeContext.Provider value={{ activeTrade, pendingInvite, isConnected }}>
            {children}
            
            {/* Trade invite popup */}
            {pendingInvite && (
                <LiveTradeInvitePopup
                    fromUsername={pendingInvite.from.username}
                    onAccept={handleAcceptInvite}
                    onDecline={handleDeclineInvite}
                />
            )}

            {/* Live trade modal */}
            {activeTrade && (
                <LiveTradeModal
                    trade={activeTrade}
                    onClose={handleCloseTrade}
                />
            )}
        </LiveTradeContext.Provider>
    );
};
