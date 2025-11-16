import type { RecordTransactionRequest, TransactionHistoryResponse, WalletStats } from '../types/cardanoTransaction'
import { API_CONFIG } from '../config/api'

const API_BASE_URL = API_CONFIG.BASE_URL

class CardanoTransactionAPI {
    private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
        const url = `${API_BASE_URL}${endpoint}`

        const config: RequestInit = {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...(options.headers || {}),
            },
        }

        try {
            const response = await fetch(url, config)

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
            }

            return await response.json()
        } catch (error) {
            if (error instanceof Error) {
                throw error
            }
            throw new Error('An unexpected error occurred')
        }
    }

    private getAuthHeaders(token: string) {
        return {
            Authorization: `Bearer ${token}`,
        }
    }

    // Record a new transaction
    async recordTransaction(data: RecordTransactionRequest, token: string) {
        return this.makeRequest('/cardano/transactions', {
            method: 'POST',
            headers: this.getAuthHeaders(token),
            body: JSON.stringify(data),
        })
    }

    // Get transaction history for a wallet
    async getTransactionHistory(
        walletAddress: string,
        token: string,
        page: number = 1,
        limit: number = 20
    ): Promise<TransactionHistoryResponse> {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
        })

        return this.makeRequest<TransactionHistoryResponse>(
            `/cardano/transactions/history/${walletAddress}?${params}`,
            {
                method: 'GET',
                headers: this.getAuthHeaders(token),
            }
        )
    }

    // Get transaction by hash
    async getTransactionByHash(txHash: string, token: string) {
        return this.makeRequest(`/cardano/transactions/${txHash}`, {
            method: 'GET',
            headers: this.getAuthHeaders(token),
        })
    }

    // Update transaction status
    async updateTransactionStatus(
        txHash: string,
        status: 'pending' | 'confirmed' | 'failed',
        token: string,
        blockNumber?: number
    ) {
        return this.makeRequest(`/cardano/transactions/${txHash}/status`, {
            method: 'PATCH',
            headers: this.getAuthHeaders(token),
            body: JSON.stringify({ status, block_number: blockNumber }),
        })
    }

    // Get wallet statistics
    async getWalletStats(walletAddress: string, token: string): Promise<{ success: boolean; stats: WalletStats }> {
        return this.makeRequest<{ success: boolean; stats: WalletStats }>(
            `/cardano/transactions/stats/${walletAddress}`,
            {
                method: 'GET',
                headers: this.getAuthHeaders(token),
            }
        )
    }
}

export const cardanoTransactionAPI = new CardanoTransactionAPI()
