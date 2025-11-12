import type React from "react"
import "../styles/WalletInstructionModal.css"

interface WalletInstructionModalProps {
    isOpen: boolean
    onClose: () => void
}

export const WalletInstructionModal: React.FC<WalletInstructionModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="wallet-instruction-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Set Up Your Cardano Wallet</h2>
                    <button className="close-button" onClick={onClose}>
                        ×
                    </button>
                </div>

                <div className="modal-content">
                    {/* Steps Grid - Horizontal Layout */}
                    <div className="steps-grid">
                        <div className="step-card">
                            <div className="step-number">1</div>
                            <h3>Install Lace Wallet</h3>
                            <p>Download and install the Lace wallet browser extension for the best Cardano experience.</p>
                            <a
                                href="https://www.lace.io/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="wallet-link"
                            >
                                Download Lace →
                            </a>
                        </div>

                        <div className="step-card">
                            <div className="step-number">2</div>
                            <h3>Create Wallet</h3>
                            <p>Set up your new wallet:</p>
                            <ul className="step-list">
                                <li>Click the Lace extension</li>
                                <li>Choose "Create new wallet"</li>
                                <li>Save recovery phrase securely</li>
                                <li>Set a strong password</li>
                            </ul>
                        </div>

                        <div className="step-card">
                            <div className="step-number">3</div>
                            <h3>Switch Network</h3>
                            <p>Change to Preview testnet:</p>
                            <ul className="step-list">
                                <li>Open Lace wallet</li>
                                <li>Go to Settings</li>
                                <li>Select "Network"</li>
                                <li>Switch to "Preview"</li>
                            </ul>
                        </div>

                        <div className="step-card">
                            <div className="step-number">4</div>
                            <h3>Connect Wallet</h3>
                            <p>Link your wallet to the app:</p>
                            <ul className="step-list">
                                <li>Return to this page</li>
                                <li>Click "Connect Wallet"</li>
                                <li>Select "Lace"</li>
                                <li>Approve connection</li>
                            </ul>
                        </div>
                    </div>

                    {/* Info Boxes - Full Width Below Steps */}
                    <div className="info-boxes-grid">
                        <div className="info-box">
                            <div className="info-content">
                                <h4>💡 Need Test ADA?</h4>
                                <p>Get free test ADA from the Cardano Faucet for testing purposes.</p>
                            </div>
                            <a
                                href="https://docs.cardano.org/cardano-testnet/tools/faucet"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="wallet-link"
                            >
                                Get Test ADA →
                            </a>
                        </div>

                        <div className="warning-box">
                            <div className="warning-content">
                                <h4>⚠️ Important Security Notes</h4>
                                <ul className="security-list">
                                    <li>Never share your recovery phrase with anyone</li>
                                    <li>This is testnet only - don't send real ADA to these addresses</li>
                                    <li>Always verify you're on the Preview network before connecting</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="btn-primary" onClick={onClose}>
                        Got It!
                    </button>
                </div>
            </div>
        </div>
    )
}
