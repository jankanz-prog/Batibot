// components/ItemModal.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { itemsAPI } from '../services/itemsAPI';
import type { Item, ItemRarity, ItemCategory, CreateItemRequest, UpdateItemRequest } from '../types/items';

interface ItemModalProps {
    item?: Item | null;
    rarities: ItemRarity[];
    categories: ItemCategory[];
    onClose: () => void;
    onSuccess: () => void;
}

export const ItemModal: React.FC<ItemModalProps> = ({
    item,
    rarities,
    categories,
    onClose,
    onSuccess
}) => {
    const { token } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category_id: '',
        rarity_id: '',
        image_url: '',
        is_tradeable: true,
        metadata_uri: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isEditing = !!item;

    useEffect(() => {
        if (item) {
            setFormData({
                name: item.name,
                description: item.description || '',
                category_id: item.category_id.toString(),
                rarity_id: item.rarity_id.toString(),
                image_url: item.image_url || '',
                is_tradeable: item.is_tradeable,
                metadata_uri: item.metadata_uri || ''
            });
        }
    }, [item]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        
        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({
                ...prev,
                [name]: checked
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) return;

        try {
            setLoading(true);
            setError(null);

            const requestData = {
                name: formData.name,
                description: formData.description || undefined,
                category_id: parseInt(formData.category_id),
                rarity_id: parseInt(formData.rarity_id),
                image_url: formData.image_url || undefined,
                is_tradeable: formData.is_tradeable,
                metadata_uri: formData.metadata_uri || undefined
            };

            if (isEditing && item) {
                await itemsAPI.updateItem(item.item_id, requestData as UpdateItemRequest, token);
            } else {
                await itemsAPI.createItem(requestData as CreateItemRequest, token);
            }

            onSuccess();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save item');
        } finally {
            setLoading(false);
        }
    };

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div className="modal-overlay" onClick={handleOverlayClick}>
            <div className="modal-content">
                <div className="modal-header">
                    <h2 className="modal-title">
                        {isEditing ? 'Edit Item' : 'Create New Item'}
                    </h2>
                    <button onClick={onClose} className="modal-close">
                        ✕
                    </button>
                </div>

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="item-form">
                    <div className="form-group">
                        <label htmlFor="name" className="form-label">
                            Item Name *
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className="form-input"
                            required
                            disabled={loading}
                            placeholder="Enter item name"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="description" className="form-label">
                            Description
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            className="form-textarea"
                            disabled={loading}
                            placeholder="Enter item description"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="category_id" className="form-label">
                            Category *
                        </label>
                        <select
                            id="category_id"
                            name="category_id"
                            value={formData.category_id}
                            onChange={handleInputChange}
                            className="form-select"
                            required
                            disabled={loading}
                        >
                            <option value="">Select a category</option>
                            {categories.map(category => (
                                <option key={category.category_id} value={category.category_id}>
                                    {category.icon && `${category.icon} `}{category.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="rarity_id" className="form-label">
                            Rarity *
                        </label>
                        <select
                            id="rarity_id"
                            name="rarity_id"
                            value={formData.rarity_id}
                            onChange={handleInputChange}
                            className="form-select"
                            required
                            disabled={loading}
                        >
                            <option value="">Select a rarity</option>
                            {rarities.map(rarity => (
                                <option key={rarity.rarity_id} value={rarity.rarity_id}>
                                    {rarity.name} (Weight: {rarity.weight})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="image_url" className="form-label">
                            Image URL
                        </label>
                        <input
                            type="url"
                            id="image_url"
                            name="image_url"
                            value={formData.image_url}
                            onChange={handleInputChange}
                            className="form-input"
                            disabled={loading}
                            placeholder="https://example.com/image.jpg"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="metadata_uri" className="form-label">
                            Metadata URI
                        </label>
                        <input
                            type="text"
                            id="metadata_uri"
                            name="metadata_uri"
                            value={formData.metadata_uri}
                            onChange={handleInputChange}
                            className="form-input"
                            disabled={loading}
                            placeholder="Optional metadata identifier"
                        />
                    </div>

                    <div className="form-checkbox">
                        <input
                            type="checkbox"
                            id="is_tradeable"
                            name="is_tradeable"
                            checked={formData.is_tradeable}
                            onChange={handleInputChange}
                            disabled={loading}
                        />
                        <label htmlFor="is_tradeable" className="form-label">
                            Item is tradeable
                        </label>
                    </div>

                    <div className="form-actions">
                        <button
                            type="button"
                            onClick={onClose}
                            className="form-btn secondary"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="form-btn primary"
                            disabled={loading || !formData.name || !formData.category_id || !formData.rarity_id}
                        >
                            {loading ? 'Saving...' : (isEditing ? 'Update Item' : 'Create Item')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
