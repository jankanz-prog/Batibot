// controllers/itemGenerationController.js
const ItemGenerationService = require('../services/itemGenerationService');

const generateItemsManually = async (req, res) => {
    try {
        const itemGenerator = new ItemGenerationService();
        const results = await itemGenerator.generateItemsNow();

        res.status(200).json({
            success: true,
            message: 'Items generated successfully',
            data: {
                itemsGenerated: results?.length || 0,
                items: results
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error generating items',
            error: error.message
        });
    }
};

module.exports = {
    generateItemsManually
};
