// components/AdminManagementPage.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { raritiesAPI, categoriesAPI } from '../services/itemsAPI';
import type { ItemRarity, ItemCategory } from '../types/items';

export const AdminManagementPage: React.FC = () => {
    const { token, isAdmin } = useAuth();
    const [activeTab, setActiveTab] = useState<'rarities' | 'categories'>('rarities');
    const [rarities, setRarities] = useState<ItemRarity[]>([]);
    const [categories, setCategories] = useState<ItemCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Rarity form state
    const [rarityForm, setRarityForm] = useState({
        name: '' as 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | '',
        color: '',
        weight: '',
        description: ''
    });

    // Category form state
    const [categoryForm, setCategoryForm] = useState({
        name: '' as 'weapon' | 'armor' | 'accessory' | 'consumable' | 'material' | 'tool' | 'misc' | '',
        description: '',
        icon: ''
    });

    const [editingRarity, setEditingRarity] = useState<ItemRarity | null>(null);
    const [editingCategory, setEditingCategory] = useState<ItemCategory | null>(null);

    useEffect(() => {
        if (isAdmin) {
            loadData();
        }
    }, [isAdmin]);

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const [raritiesResponse, categoriesResponse] = await Promise.all([
                raritiesAPI.getAllRarities(),
                categoriesAPI.getAllCategories()
            ]);

            if (raritiesResponse.success && raritiesResponse.data) {
                setRarities(raritiesResponse.data);
            }
            if (categoriesResponse.success && categoriesResponse.data) {
                setCategories(categoriesResponse.data);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    // Rarity handlers
    const handleRaritySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token || !rarityForm.name) return;

        try {
            const requestData = {
                name: rarityForm.name as 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary',
                color: rarityForm.color || undefined,
                weight: rarityForm.weight ? parseInt(rarityForm.weight) : undefined,
                description: rarityForm.description || undefined
            };

            if (editingRarity) {
                await raritiesAPI.updateRarity(editingRarity.rarity_id, requestData, token);
            } else {
                await raritiesAPI.createRarity(requestData, token);
            }

            resetRarityForm();
            await loadData();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save rarity');
        }
    };

    const handleEditRarity = (rarity: ItemRarity) => {
        setEditingRarity(rarity);
        setRarityForm({
            name: rarity.name,
            color: rarity.color,
            weight: rarity.weight.toString(),
            description: rarity.description || ''
        });
    };

    const handleDeleteRarity = async (rarity: ItemRarity) => {
        if (!token || !confirm(`Delete rarity "${rarity.name}"?`)) return;

        try {
            await raritiesAPI.deleteRarity(rarity.rarity_id, token);
            await loadData();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete rarity');
        }
    };

    const resetRarityForm = () => {
        setRarityForm({ name: '', color: '', weight: '', description: '' });
        setEditingRarity(null);
    };

    // Category handlers
    const handleCategorySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token || !categoryForm.name) return;

        try {
            const requestData = {
                name: categoryForm.name as 'weapon' | 'armor' | 'accessory' | 'consumable' | 'material' | 'tool' | 'misc',
                description: categoryForm.description || undefined,
                icon: categoryForm.icon || undefined
            };

            if (editingCategory) {
                await categoriesAPI.updateCategory(editingCategory.category_id, requestData, token);
            } else {
                await categoriesAPI.createCategory(requestData, token);
            }

            resetCategoryForm();
            await loadData();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save category');
        }
    };

    const handleEditCategory = (category: ItemCategory) => {
        setEditingCategory(category);
        setCategoryForm({
            name: category.name,
            description: category.description || '',
            icon: category.icon || ''
        });
    };

    const handleDeleteCategory = async (category: ItemCategory) => {
        if (!token || !confirm(`Delete category "${category.name}"?`)) return;

        try {
            await categoriesAPI.deleteCategory(category.category_id, token);
            await loadData();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete category');
        }
    };

    const resetCategoryForm = () => {
        setCategoryForm({ name: '', description: '', icon: '' });
        setEditingCategory(null);
    };

    if (!isAdmin) {
        return (
            <div className="items-page">
                <div className="empty-state">
                    <h3>Access Denied</h3>
                    <p>You need admin privileges to access this page.</p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="items-page">
                <div className="loading-spinner">
                    <div className="spinner"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="items-page">
            <div className="items-header">
                <h1 className="items-title">Admin Management</h1>
                <div className="admin-controls">
                    <button 
                        onClick={() => setActiveTab('rarities')}
                        className={`admin-btn ${activeTab === 'rarities' ? 'active' : ''}`}
                    >
                        🏆 Rarities
                    </button>
                    <button 
                        onClick={() => setActiveTab('categories')}
                        className={`admin-btn ${activeTab === 'categories' ? 'active' : ''}`}
                    >
                        📦 Categories
                    </button>
                </div>
            </div>

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            {activeTab === 'rarities' && (
                <div className="admin-section">
                    <div className="admin-form-section">
                        <h2>{editingRarity ? 'Edit Rarity' : 'Create New Rarity'}</h2>
                        <form onSubmit={handleRaritySubmit} className="item-form">
                            <div className="form-group">
                                <label className="form-label">Rarity Name *</label>
                                <select
                                    value={rarityForm.name}
                                    onChange={(e) => setRarityForm(prev => ({ ...prev, name: e.target.value as any }))}
                                    className="form-select"
                                    required
                                >
                                    <option value="">Select rarity</option>
                                    <option value="common">Common</option>
                                    <option value="uncommon">Uncommon</option>
                                    <option value="rare">Rare</option>
                                    <option value="epic">Epic</option>
                                    <option value="legendary">Legendary</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Color (Hex)</label>
                                <input
                                    type="color"
                                    value={rarityForm.color}
                                    onChange={(e) => setRarityForm(prev => ({ ...prev, color: e.target.value }))}
                                    className="form-input"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Weight (Drop Rate)</label>
                                <input
                                    type="number"
                                    value={rarityForm.weight}
                                    onChange={(e) => setRarityForm(prev => ({ ...prev, weight: e.target.value }))}
                                    className="form-input"
                                    min="1"
                                    max="100"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Description</label>
                                <textarea
                                    value={rarityForm.description}
                                    onChange={(e) => setRarityForm(prev => ({ ...prev, description: e.target.value }))}
                                    className="form-textarea"
                                />
                            </div>

                            <div className="form-actions">
                                {editingRarity && (
                                    <button type="button" onClick={resetRarityForm} className="form-btn secondary">
                                        Cancel
                                    </button>
                                )}
                                <button type="submit" className="form-btn primary">
                                    {editingRarity ? 'Update' : 'Create'} Rarity
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="admin-list-section">
                        <h3>Existing Rarities</h3>
                        <div className="items-grid">
                            {rarities.map(rarity => (
                                <div key={rarity.rarity_id} className="item-card" style={{ '--rarity-color': rarity.color } as React.CSSProperties}>
                                    <div className="item-header">
                                        <div className="item-info">
                                            <h3 className="item-name" style={{ color: rarity.color }}>
                                                {rarity.name}
                                            </h3>
                                            <div className="item-category">
                                                Weight: {rarity.weight}
                                            </div>
                                        </div>
                                        <div 
                                            className="rarity-dot" 
                                            style={{ 
                                                background: rarity.color,
                                                width: '30px',
                                                height: '30px'
                                            }}
                                        ></div>
                                    </div>
                                    
                                    {rarity.description && (
                                        <p className="item-description">{rarity.description}</p>
                                    )}

                                    <div className="item-footer">
                                        <span style={{ color: rarity.color }}>{rarity.color}</span>
                                        <div className="item-actions">
                                            <button 
                                                onClick={() => handleEditRarity(rarity)}
                                                className="item-btn edit"
                                            >
                                                ✏️
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteRarity(rarity)}
                                                className="item-btn delete"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'categories' && (
                <div className="admin-section">
                    <div className="admin-form-section">
                        <h2>{editingCategory ? 'Edit Category' : 'Create New Category'}</h2>
                        <form onSubmit={handleCategorySubmit} className="item-form">
                            <div className="form-group">
                                <label className="form-label">Category Name *</label>
                                <select
                                    value={categoryForm.name}
                                    onChange={(e) => setCategoryForm(prev => ({ ...prev, name: e.target.value as any }))}
                                    className="form-select"
                                    required
                                >
                                    <option value="">Select category</option>
                                    <option value="weapon">Weapon</option>
                                    <option value="armor">Armor</option>
                                    <option value="accessory">Accessory</option>
                                    <option value="consumable">Consumable</option>
                                    <option value="material">Material</option>
                                    <option value="tool">Tool</option>
                                    <option value="misc">Miscellaneous</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Icon (Emoji)</label>
                                <input
                                    type="text"
                                    value={categoryForm.icon}
                                    onChange={(e) => setCategoryForm(prev => ({ ...prev, icon: e.target.value }))}
                                    className="form-input"
                                    placeholder="⚔️"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Description</label>
                                <textarea
                                    value={categoryForm.description}
                                    onChange={(e) => setCategoryForm(prev => ({ ...prev, description: e.target.value }))}
                                    className="form-textarea"
                                />
                            </div>

                            <div className="form-actions">
                                {editingCategory && (
                                    <button type="button" onClick={resetCategoryForm} className="form-btn secondary">
                                        Cancel
                                    </button>
                                )}
                                <button type="submit" className="form-btn primary">
                                    {editingCategory ? 'Update' : 'Create'} Category
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="admin-list-section">
                        <h3>Existing Categories</h3>
                        <div className="items-grid">
                            {categories.map(category => (
                                <div key={category.category_id} className="item-card">
                                    <div className="item-header">
                                        <div className="item-info">
                                            <h3 className="item-name">
                                                {category.icon && `${category.icon} `}
                                                {category.name}
                                            </h3>
                                        </div>
                                    </div>
                                    
                                    {category.description && (
                                        <p className="item-description">{category.description}</p>
                                    )}

                                    <div className="item-footer">
                                        <span>ID: {category.category_id}</span>
                                        <div className="item-actions">
                                            <button 
                                                onClick={() => handleEditCategory(category)}
                                                className="item-btn edit"
                                            >
                                                ✏️
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteCategory(category)}
                                                className="item-btn delete"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
