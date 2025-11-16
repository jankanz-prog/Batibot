import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { cardanoTransactionAPI } from '../services/cardanoTransactionAPI'
import type { CardanoTransaction } from '../types/cardanoTransaction'
import { ArrowUpRight, ArrowDownLeft, ExternalLink, Loader, AlertCircle, User, HelpCircle } from 'lucide-react'
import '../styles/TransactionHistory.css'

interface TransactionHistoryProps {
    walletAddress: string
}

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({ walletAddress }) => {
    const { token } = useAuth()
    const [transactions, setTransactions] = useState<CardanoTransaction[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)

    useEffect(() => {
        fetchTransactions()
    }, [walletAddress, page])

    const fetchTransactions = async () => {
        if (!walletAddress || !token) return

        try {
            setLoading(true)
            setError('')
            const response = await cardanoTransactionAPI.getTransactionHistory(
                walletAddress,
                token,
                page,
                20
            )

            setTransactions(response.transactions)
            setTotalPages(response.pagination.totalPages)
        } catch (err) {
            console.error('Error fetching transaction history:', err)
            setError('Failed to load transaction history')
        } finally {
            setLoading(false)
        }
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    const formatAmount = (amount: string) => {
        return parseFloat(amount).toFixed(2)
    }

    const getTransactionType = (tx: CardanoTransaction) => {
        return tx.sender_wallet_address === walletAddress ? 'sent' : 'received'
    }

    const getOtherParty = (tx: CardanoTransaction) => {
        const type = getTransactionType(tx)
        if (type === 'sent') {
            return {
                address: tx.receiver_wallet_address,
                user: tx.receiver_user,
            }
        } else {
            return {
                address: tx.sender_wallet_address,
                user: tx.sender_user,
            }
        }
    }

    const handleRefresh = () => {
        setPage(1)
        fetchTransactions()
    }

    if (loading && transactions.length === 0) {
        return (
            <div className="transaction-history-loading">
                <Loader size={32} className="spinner" />
                <p>Loading transaction history...</p>
            </div>
        )
    }

    return (
        <div className="transaction-history">
            <div className="transaction-header">
                <h3>Transaction History</h3>
                <button className="refresh-btn" onClick={handleRefresh} disabled={loading}>
                    <Loader size={18} className={loading ? 'spinner' : ''} />
                    Refresh
                </button>
            </div>

            {error && (
                <div className="error-message">
                    <AlertCircle size={20} />
                    <p>{error}</p>
                </div>
            )}

            {transactions.length === 0 && !loading && (
                <div className="empty-state">
                    <p>No transactions yet</p>
                    <small>Your transaction history will appear here</small>
                </div>
            )}

            <div className="transactions-list">
                {transactions.map((tx) => {
                    const type = getTransactionType(tx)
                    const otherParty = getOtherParty(tx)
                    const isSent = type === 'sent'

                    return (
                        <div key={tx.transaction_id} className={`transaction-item ${type}`}>
                            <div className="transaction-icon">
                                {isSent ? (
                                    <ArrowUpRight size={24} className="icon-sent" />
                                ) : (
                                    <ArrowDownLeft size={24} className="icon-received" />
                                )}
                            </div>

                            <div className="transaction-details">
                                <div className="transaction-party">
                                    {otherParty.user ? (
                                        <div className="known-user">
                                            <User size={16} />
                                            <span className="username">{otherParty.user.username}</span>
                                            <span className="user-label">(Batibot User)</span>
                                        </div>
                                    ) : (
                                        <div className="unknown-user">
                                            <HelpCircle size={16} />
                                            <span className="unknown-label">Unknown Sender</span>
                                        </div>
                                    )}
                                </div>

                                <div className="transaction-address">
                                    {otherParty.address.substring(0, 20)}...{otherParty.address.substring(otherParty.address.length - 10)}
                                </div>

                                <div className="transaction-meta">
                                    <span className="transaction-date">{formatDate(tx.timestamp)}</span>
                                    <span className={`transaction-status status-${tx.status}`}>
                                        {tx.status}
                                    </span>
                                </div>
                            </div>

                            <div className="transaction-amount">
                                <span className={`amount ${type}`}>
                                    {isSent ? '-' : '+'} {formatAmount(tx.amount)} ADA
                                </span>
                                {tx.fee && isSent && (
                                    <span className="fee">Fee: {formatAmount(tx.fee)} ADA</span>
                                )}
                                <a
                                    href={`https://preview.cardanoscan.io/transaction/${tx.tx_hash}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="view-link"
                                >
                                    <ExternalLink size={14} />
                                    View on Explorer
                                </a>
                            </div>
                        </div>
                    )
                })}
            </div>

            {totalPages > 1 && (
                <div className="pagination">
                    <button
                        className="pagination-btn"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1 || loading}
                    >
                        Previous
                    </button>
                    <span className="pagination-info">
                        Page {page} of {totalPages}
                    </span>
                    <button
                        className="pagination-btn"
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages || loading}
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    )
}
