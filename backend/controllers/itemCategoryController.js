// controllers/itemCategoryController.js
const ItemCategory = require('../models/itemCategoryModel');

const createCategory = async (req, res) => {
    try {
        const { name, description, icon } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Category name is required'
            });
        }

        const validCategories = ['weapon', 'armor', 'accessory', 'consumable', 'material', 'tool', 'misc'];
        if (!validCategories.includes(name.toLowerCase())) {
            return res.status(400).json({
                success: false,
                message: `Invalid category name. Must be one of: ${validCategories.join(', ')}`
            });
        }

        const category = await ItemCategory.create({
            name: name.toLowerCase(),
            description,
            icon
        });

        res.status(201).json({
            success: true,
            message: 'Category created successfully',
            data: category
        });
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({
                success: false,
                message: 'Category already exists'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

const getAllCategories = async (req, res) => {
    try {
        const categories = await ItemCategory.findAll({
            order: [['category_id', 'ASC']]
        });

        res.status(200).json({
            success: true,
            message: 'Categories retrieved successfully',
            data: categories
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, icon } = req.body;

        const category = await ItemCategory.findByPk(id);
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        // Validate name if provided
        if (name) {
            const validCategories = ['weapon', 'armor', 'accessory', 'consumable', 'material', 'tool', 'misc'];
            if (!validCategories.includes(name.toLowerCase())) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid category name. Must be one of: ${validCategories.join(', ')}`
                });
            }
        }

        await category.update({
            name: name ? name.toLowerCase() : category.name,
            description: description !== undefined ? description : category.description,
            icon: icon !== undefined ? icon : category.icon
        });

        res.status(200).json({
            success: true,
            message: 'Category updated successfully',
            data: category
        });
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({
                success: false,
                message: 'Category name already exists'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        const category = await ItemCategory.findByPk(id);
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        await category.destroy();

        res.status(200).json({
            success: true,
            message: 'Category deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

module.exports = {
    createCategory,
    getAllCategories,
    updateCategory,
    deleteCategory
};
