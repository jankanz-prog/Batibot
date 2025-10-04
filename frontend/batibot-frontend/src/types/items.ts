// types/items.ts
export interface ItemRarity {
    rarity_id: number;
    name: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
    color: string;
    weight: number;
    description?: string;
}

export interface ItemCategory {
    category_id: number;
    name: 'weapon' | 'armor' | 'accessory' | 'consumable' | 'material' | 'tool' | 'misc';
    description?: string;
    icon?: string;
}

export interface Item {
    item_id: number;
    name: string;
    description?: string;
    category_id: number;
    rarity_id: number;
    image_url?: string;
    is_tradeable: boolean;
    metadata_uri?: string;
    created_at: string;
    rarity?: ItemRarity;
    category?: ItemCategory;
}

export interface InventoryItem {
    inventory_id: number;
    user_id: number;
    item_id: number;
    quantity: number;
    acquired_at: string;
    Item?: Item;
}

// Request types
export interface CreateItemRequest {
    name: string;
    description?: string;
    category_id: number;
    rarity_id: number;
    image_url?: string;
    is_tradeable?: boolean;
    metadata_uri?: string;
}

export interface UpdateItemRequest {
    name?: string;
    description?: string;
    category_id?: number;
    rarity_id?: number;
    image_url?: string;
    is_tradeable?: boolean;
    metadata_uri?: string;
}

export interface CreateRarityRequest {
    name: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
    color?: string;
    weight?: number;
    description?: string;
}

export interface UpdateRarityRequest {
    name?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
    color?: string;
    weight?: number;
    description?: string;
}

export interface CreateCategoryRequest {
    name: 'weapon' | 'armor' | 'accessory' | 'consumable' | 'material' | 'tool' | 'misc';
    description?: string;
    icon?: string;
}

export interface UpdateCategoryRequest {
    name?: 'weapon' | 'armor' | 'accessory' | 'consumable' | 'material' | 'tool' | 'misc';
    description?: string;
    icon?: string;
}

export interface AddToInventoryRequest {
    item_id: number;
    quantity?: number;
}

export interface RemoveFromInventoryRequest {
    item_id: number;
    quantity?: number;
}

// Response types
export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data?: T;
    error?: string;
}
