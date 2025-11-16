import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useCardanoWallet } from '../context/CardanoWalletContext'
import { cardanoTransactionAPI } from '../services/cardanoTransactionAPI'
import { Blaze, Blockfrost, Core, WebWallet } from '@blaze-cardano/sdk'
import { Send, X, AlertCircle, Loader } from 'lucide-react'
import '../styles/SendTransactionModal.css'

interface SendTransactionModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess?: () => void
}

export const SendTransactionModal: React.FC<SendTransactionModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
}) => {
    const { user, token } = useAuth()
    const { walletApi, isConnected } = useCardanoWallet()
    const [recipientAddress, setRecipientAddress] = useState('')
    const [amount, setAmount] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    const handleSendTransaction = async () => {
        if (!isConnected || !walletApi || !user?.wallet_address) {
            setError('Please connect your wallet first')
            return
        }

        if (!recipientAddress || !amount) {
            setError('Please enter recipient address and amount')
            return
        }

        const amountNum = parseFloat(amount)
        if (isNaN(amountNum) || amountNum <= 0) {
            setError('Please enter a valid amount')
            return
        }

        try {
            setLoading(true)
            setError('')
            setSuccess('')

            // Validate recipient address
            try {
                Core.Address.fromBech32(recipientAddress)
            } catch (err) {
                throw new Error('Invalid Cardano address format')
            }

            // Initialize Blaze with Blockfrost provider
            const provider = new Blockfrost({
                network: 'cardano-preview',
                projectId: import.meta.env.VITE_BLOCKFROST_PROJECT_ID,
            })

            const wallet = new WebWallet(walletApi as any)
            const blaze = await Blaze.from(provider, wallet)

            // Convert ADA to lovelace (1 ADA = 1,000,000 lovelace)
            const lovelace = BigInt(Math.floor(amountNum * 1_000_000))

            // Build transaction
            const tx = await blaze
                .newTransaction()
                .payLovelace(Core.Address.fromBech32(recipientAddress), lovelace)
                .complete()

            // Sign transaction
            const signed = await blaze.signTransaction(tx)

            // Submit transaction
            const txHash = await blaze.provider.postTransactionToChain(signed)

            console.log('Transaction submitted:', txHash)

            // Record transaction in database
            try {
                await cardanoTransactionAPI.recordTransaction(
                    {
                        tx_hash: txHash,
                        sender_wallet_address: user.wallet_address,
                        receiver_wallet_address: recipientAddress,
                        amount: amount,
                        status: 'pending',
                    },
                    token!
                )
            } catch (dbError) {
                console.error('Failed to record transaction in database:', dbError)
                // Continue even if DB recording fails
            }

            setSuccess(`Transaction sent successfully! TX Hash: ${txHash.substring(0, 20)}...`)
            setRecipientAddress('')
            setAmount('')

            // Wait a moment then close and trigger success callback
            setTimeout(() => {
                onSuccess?.()
                onClose()
            }, 3000)
        } catch (err) {
            console.error('Transaction error:', err)
            setError(
                err instanceof Error
                    ? err.message
                    : 'Failed to send transaction. Please check your balance and try again.'
            )
        } finally {
            setLoading(false)
        }
    }

    const handleClose = () => {
        setRecipientAddress('')
        setAmount('')
        setError('')
        setSuccess('')
        onClose()
    }

    if (!isOpen) return null

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="send-transaction-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <div className="modal-title">
                        <Send size={24} />
                        <h2>Send ADA</h2>
                    </div>
                    <button className="close-button" onClick={handleClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className="modal-body">
                    {!isConnected && (
                        <div className="warning-banner">
                            <AlertCircle size={20} />
                            <p>Please connect your wallet in the Profile page first</p>
                        </div>
                    )}

                    {error && (
                        <div className="error-banner">
                            <AlertCircle size={20} />
                            <p>{error}</p>
                        </div>
                    )}

                    {success && (
                        <div className="success-banner">
                            <p>{success}</p>
                        </div>
                    )}

                    <div className="form-group">
                        <label htmlFor="recipient">Recipient Address</label>
                        <input
                            id="recipient"
                            type="text"
                            value={recipientAddress}
                            onChange={(e) => setRecipientAddress(e.target.value)}
                            placeholder="addr_test1..."
                            disabled={loading || !isConnected}
                            className="input-field"
                        />
                        <small className="input-hint">Enter Cardano testnet address (Preview network)</small>
                    </div>

                    <div className="form-group">
                        <label htmlFor="amount">Amount (ADA)</label>
                        <input
                            id="amount"
                            type="number"
                            step="0.000001"
                            min="0"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.00"
                            disabled={loading || !isConnected}
                            className="input-field"
                        />
                        <small className="input-hint">Minimum transaction: ~1 ADA (includes fee)</small>
                    </div>

                    <div className="modal-actions">
                        <button
                            className="btn btn-secondary"
                            onClick={handleClose}
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            className="btn btn-primary"
                            onClick={handleSendTransaction}
                            disabled={loading || !isConnected || !recipientAddress || !amount}
                        >
                            {loading ? (
                                <>
                                    <Loader size={18} className="spinner" />
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <Send size={18} />
                                    Send Transaction
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
