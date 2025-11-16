import React from 'react'
import { AlertTriangle, X } from 'lucide-react'
import '../styles/WalletMismatchModal.css'

interface WalletMismatchModalProps {
    isOpen: boolean
    onClose: () => void
    expectedWallet: string
    connectedWallet: string
    onDisconnect: () => void
}

export const WalletMismatchModal: React.FC<WalletMismatchModalProps> = ({
    isOpen,
    onClose,
    expectedWallet,
    connectedWallet,
    onDisconnect,
}) => {
    if (!isOpen) return null

    const formatAddress = (address: string) => {
        if (!address) return ''
        return `${address.substring(0, 15)}...${address.substring(address.length - 10)}`
    }

    return (
        <div className="wallet-mismatch-overlay" onClick={onClose}>
            <div className="wallet-mismatch-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <div className="header-title">
                        <AlertTriangle size={28} className="warning-icon" />
                        <h2>Wrong Lace Wallet Detected</h2>
                    </div>
                    <button onClick={onClose} className="close-btn">
                        <X size={20} />
                    </button>
                </div>

                <div className="modal-body">
                    <div className="warning-message">
                        <p>The wallet connected in your Lace extension does not match the wallet saved to your account.</p>
                    </div>

                    <div className="wallet-comparison">
                        <div className="wallet-info expected">
                            <div className="wallet-label">
                                <span className="label-text">Expected Wallet</span>
                                <span className="badge badge-success">Saved</span>
                            </div>
                            <div className="wallet-address">
                                <code>{formatAddress(expectedWallet)}</code>
                            </div>
                        </div>

                        <div className="wallet-divider">
                            <AlertTriangle size={20} />
                        </div>

                        <div className="wallet-info connected">
                            <div className="wallet-label">
                                <span className="label-text">Connected Wallet</span>
                                <span className="badge badge-warning">Current</span>
                            </div>
                            <div className="wallet-address">
                                <code>{formatAddress(connectedWallet)}</code>
                            </div>
                        </div>
                    </div>

                    <div className="instructions">
                        <h4>What to do:</h4>
                        <ol>
                            <li>Open your Lace wallet extension</li>
                            <li>Switch to the correct wallet address shown above</li>
                            <li>Reconnect your wallet on this page</li>
                        </ol>
                        <p className="note">
                            <strong>Note:</strong> You can only use one wallet per account. If you want to change wallets, 
                            please disconnect first and then connect with a different wallet.
                        </p>
                    </div>
                </div>

                <div className="modal-actions">
                    <button onClick={onClose} className="btn btn-secondary">
                        I'll Switch Wallets
                    </button>
                    <button onClick={onDisconnect} className="btn btn-primary">
                        Disconnect Wallet
                    </button>
                </div>
            </div>
        </div>
    )
}
