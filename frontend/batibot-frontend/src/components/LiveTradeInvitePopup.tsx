// components/LiveTradeInvitePopup.tsx
import React from 'react';
import { Handshake, Check, X } from 'lucide-react';
import '../styles/LiveTradeInvitePopup.css';

interface LiveTradeInvitePopupProps {
    fromUsername: string;
    onAccept: () => void;
    onDecline: () => void;
}

export const LiveTradeInvitePopup: React.FC<LiveTradeInvitePopupProps> = ({
    fromUsername,
    onAccept,
    onDecline
}) => {
    return (
        <div className="live-trade-invite-popup">
            <div className="invite-popup-header">
                <Handshake size={20} />
                <h3>Live Trade Request</h3>
            </div>
            <div className="invite-popup-body">
                <p><strong>{fromUsername}</strong> wants to trade with you</p>
                <div className="invite-popup-actions">
                    <button onClick={onAccept} className="invite-accept-btn">
                        <Check size={18} /> View Offer
                    </button>
                    <button onClick={onDecline} className="invite-decline-btn">
                        <X size={18} /> Decline
                    </button>
                </div>
            </div>
        </div>
    );
};
