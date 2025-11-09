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
                    <div className="instruction-section">
                        <h3>Step 1: Install Lace Wallet Extension</h3>
                        <p>
                            You need a Cardano wallet to connect to this application. We recommend Lace wallet
                            for the best experience.
                        </p>
                        <a
                            href="https://www.lace.io/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="wallet-link"
                        >
                            Download Lace Wallet →
                        </a>
                    </div>

                    <div className="instruction-section">
                        <h3>Step 2: Create a New Wallet</h3>
                        <ol>
                            <li>Click on the Lace extension icon in your browser</li>
                            <li>Choose "Create a new wallet"</li>
                            <li>Write down your recovery phrase (keep it safe!)</li>
                            <li>Set a strong password</li>
                            <li>Complete the wallet setup</li>
                        </ol>
                    </div>

                    <div className="instruction-section">
                        <h3>Step 3: Switch to Preview Network</h3>
                        <p>
                            <strong>Important:</strong> This application uses the Cardano Preview testnet.
                        </p>
                        <ol>
                            <li>Open your Lace wallet</li>
                            <li>Go to Settings</li>
                            <li>Select "Network"</li>
                            <li>Switch to "Preview" network</li>
                        </ol>
                    </div>

                    <div className="instruction-section">
                        <h3>Step 4: Connect Your Wallet</h3>
                        <p>
                            Once your wallet is set up and on the Preview network:
                        </p>
                        <ol>
                            <li>Come back to this page</li>
                            <li>Click "Connect Wallet"</li>
                            <li>Select "Lace" from the dropdown</li>
                            <li>Approve the connection request</li>
                        </ol>
                    </div>

                    <div className="instruction-section info-box">
                        <h4>💡 Need Test ADA?</h4>
                        <p>
                            Since this is a testnet, you can get free test ADA from the Cardano Faucet:
                        </p>
                        <a
                            href="https://docs.cardano.org/cardano-testnet/tools/faucet"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="wallet-link"
                        >
                            Get Test ADA →
                        </a>
                    </div>

                    <div className="instruction-section warning-box">
                        <h4>⚠️ Important Security Notes</h4>
                        <ul>
                            <li>Never share your recovery phrase with anyone</li>
                            <li>This is a testnet - don't send real ADA to these addresses</li>
                            <li>Always verify you're on the Preview network</li>
                        </ul>
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
