export interface CardanoTransaction {
    transaction_id: string
    tx_hash: string
    sender_wallet_address: string
    sender_user_id?: number
    sender_user?: {
        id: number
        username: string
    }
    receiver_wallet_address: string
    receiver_user_id?: number
    receiver_user?: {
        id: number
        username: string
    }
    amount: string
    fee?: string
    status: 'pending' | 'confirmed' | 'failed'
    block_number?: number
    timestamp: string
    metadata?: string
    created_at: string
    updated_at: string
}

export interface RecordTransactionRequest {
    tx_hash: string
    sender_wallet_address: string
    receiver_wallet_address: string
    amount: string
    fee?: string
    status?: 'pending' | 'confirmed' | 'failed'
    block_number?: number
    metadata?: any
}

export interface TransactionHistoryResponse {
    success: boolean
    transactions: CardanoTransaction[]
    pagination: {
        total: number
        page: number
        limit: number
        totalPages: number
    }
}

export interface WalletStats {
    sent_count: number
    received_count: number
    total_sent: string
    total_received: string
}
