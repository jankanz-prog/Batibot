// services/tradeAPI.ts - Trade API service
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

interface TradeItem {
    item_id: number;
    name?: string;
    quantity: number;
}

interface CreateTradeRequest {
    receiver_id: number;
    sender_items: TradeItem[];
    receiver_items: TradeItem[];
}

export const tradeAPI = {
    // Get marketplace items (items from other users)
    async getMarketplaceItems(token: string) {
        try {
            const response = await fetch(`${API_BASE_URL}/trades/marketplace`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch marketplace items');
            }

            return data;
        } catch (error) {
            console.error('Error fetching marketplace items:', error);
            throw error;
        }
    },

    // Get user's trade offers (sent and received)
    async getTradeOffers(token: string) {
        try {
            const response = await fetch(`${API_BASE_URL}/trades/offers`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch trade offers');
            }

            return data;
        } catch (error) {
            console.error('Error fetching trade offers:', error);
            throw error;
        }
    },

    // Create new trade offer
    async createTradeOffer(tradeData: CreateTradeRequest, token: string) {
        try {
            const response = await fetch(`${API_BASE_URL}/trades`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(tradeData)
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Failed to create trade offer');
            }

            return data;
        } catch (error) {
            console.error('Error creating trade offer:', error);
            throw error;
        }
    },

    // Accept trade offer
    async acceptTradeOffer(tradeId: string, token: string) {
        try {
            const response = await fetch(`${API_BASE_URL}/trades/${tradeId}/accept`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Failed to accept trade offer');
            }

            return data;
        } catch (error) {
            console.error('Error accepting trade offer:', error);
            throw error;
        }
    },

    // Reject trade offer
    async rejectTradeOffer(tradeId: string, token: string) {
        try {
            const response = await fetch(`${API_BASE_URL}/trades/${tradeId}/reject`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Failed to reject trade offer');
            }

            return data;
        } catch (error) {
            console.error('Error rejecting trade offer:', error);
            throw error;
        }
    },

    // Cancel trade offer (sender only)
    async cancelTradeOffer(tradeId: string, token: string) {
        try {
            const response = await fetch(`${API_BASE_URL}/trades/${tradeId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Failed to cancel trade offer');
            }

            return data;
        } catch (error) {
            console.error('Error cancelling trade offer:', error);
            throw error;
        }
    },

    // Get user trade statistics
    async getTradeStatistics(token: string) {
        try {
            const response = await fetch(`${API_BASE_URL}/trades/statistics`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch trade statistics');
            }

            return data;
        } catch (error) {
            console.error('Error fetching trade statistics:', error);
            throw error;
        }
    }
};
