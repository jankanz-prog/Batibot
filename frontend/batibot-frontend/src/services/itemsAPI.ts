// services/itemsAPI.ts
import { API_CONFIG } from '../config/api';
import type {
    Item,
    ItemRarity,
    ItemCategory,
    InventoryItem,
    CreateItemRequest,
    UpdateItemRequest,
    CreateRarityRequest,
    UpdateRarityRequest,
    CreateCategoryRequest,
    UpdateCategoryRequest,
    AddToInventoryRequest,
    RemoveFromInventoryRequest,
    ApiResponse
} from '../types/items';

const BASE_URL = API_CONFIG.BASE_URL;

// Helper function for API calls
const apiCall = async <T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<ApiResponse<T>> => {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        ...options,
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Network error' }));
        throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    return response.json();
};

// Items API
export const itemsAPI = {
    // Get all items
    getAllItems: async (): Promise<ApiResponse<Item[]>> => {
        return apiCall<Item[]>('/items');
    },

    // Get item by ID
    getItemById: async (id: number): Promise<ApiResponse<Item>> => {
        return apiCall<Item>(`/items/${id}`);
    },

    // Create item (Admin only)
    createItem: async (itemData: CreateItemRequest, token: string): Promise<ApiResponse<Item>> => {
        return apiCall<Item>('/items', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(itemData),
        });
    },

    // Update item (Admin only)
    updateItem: async (id: number, itemData: UpdateItemRequest, token: string): Promise<ApiResponse<Item>> => {
        return apiCall<Item>(`/items/${id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(itemData),
        });
    },

    // Delete item (Admin only)
    deleteItem: async (id: number, token: string): Promise<ApiResponse<void>> => {
        return apiCall<void>(`/items/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
    },
};

// Rarities API
export const raritiesAPI = {
    // Get all rarities
    getAllRarities: async (): Promise<ApiResponse<ItemRarity[]>> => {
        return apiCall<ItemRarity[]>('/rarities');
    },

    // Create rarity (Admin only)
    createRarity: async (rarityData: CreateRarityRequest, token: string): Promise<ApiResponse<ItemRarity>> => {
        return apiCall<ItemRarity>('/rarities', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(rarityData),
        });
    },

    // Update rarity (Admin only)
    updateRarity: async (id: number, rarityData: UpdateRarityRequest, token: string): Promise<ApiResponse<ItemRarity>> => {
        return apiCall<ItemRarity>(`/rarities/${id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(rarityData),
        });
    },

    // Delete rarity (Admin only)
    deleteRarity: async (id: number, token: string): Promise<ApiResponse<void>> => {
        return apiCall<void>(`/rarities/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
    },
};

// Categories API
export const categoriesAPI = {
    // Get all categories
    getAllCategories: async (): Promise<ApiResponse<ItemCategory[]>> => {
        return apiCall<ItemCategory[]>('/categories');
    },

    // Create category (Admin only)
    createCategory: async (categoryData: CreateCategoryRequest, token: string): Promise<ApiResponse<ItemCategory>> => {
        return apiCall<ItemCategory>('/categories', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(categoryData),
        });
    },

    // Update category (Admin only)
    updateCategory: async (id: number, categoryData: UpdateCategoryRequest, token: string): Promise<ApiResponse<ItemCategory>> => {
        return apiCall<ItemCategory>(`/categories/${id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(categoryData),
        });
    },

    // Delete category (Admin only)
    deleteCategory: async (id: number, token: string): Promise<ApiResponse<void>> => {
        return apiCall<void>(`/categories/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
    },
};

// Inventory API
export const inventoryAPI = {
    // Get user's inventory
    getInventory: async (token: string): Promise<ApiResponse<InventoryItem[]>> => {
        return apiCall<InventoryItem[]>('/auth/inventory', {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
    },

    // Add item to inventory
    addToInventory: async (inventoryData: AddToInventoryRequest, token: string): Promise<ApiResponse<InventoryItem>> => {
        return apiCall<InventoryItem>('/auth/inventory', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(inventoryData),
        });
    },

    // Remove item from inventory
    removeFromInventory: async (inventoryData: RemoveFromInventoryRequest, token: string): Promise<ApiResponse<InventoryItem | null>> => {
        return apiCall<InventoryItem | null>('/auth/inventory/remove', {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(inventoryData),
        });
    },
};
