// models/marketplaceListingModel.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MarketplaceListing = sequelize.define('MarketplaceListing', {
    listing_id: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false
    },
    seller_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    item_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'items',
            key: 'item_id'
        }
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            min: 0
        }
    },
    status: {
        type: DataTypes.ENUM('Active', 'Sold', 'Cancelled'),
        allowNull: false,
        defaultValue: 'Active'
    }
}, {
    tableName: 'marketplace_listings',
    timestamps: true
});

module.exports = MarketplaceListing;
