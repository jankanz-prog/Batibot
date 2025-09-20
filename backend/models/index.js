// models/index.js
const User = require('./userModel');
const Inventory = require('./inventoryModel');
const Item = require('./itemModel');
const ChatMessage = require('./chatMessageModel');
const MarketplaceListing = require('./marketplaceListingModel');
const Trade = require('./tradeModel');
const TradeItem = require('./tradeItemModel');
const Wallet = require('./walletModel');
const TrustScore = require('./trustScoreModel');
const Notification = require('./notificationModel');
const  Profile = require('./profileModel');
const Note = require('./noteModel');

// Define associations
User.hasOne(Inventory, { foreignKey: 'user_id' });
Inventory.belongsTo(User, { foreignKey: 'user_id' });
Inventory.belongsTo(Item, { foreignKey: 'item_id' });
Item.hasMany(Inventory, { foreignKey: 'item_id' });

//ChatMessage associations
User.hasMany(ChatMessage, { foreignKey: 'sender_id', as: 'SentMessages' });
User.hasMany(ChatMessage, { foreignKey: 'receiver_id', as: 'ReceivedMessages' });
ChatMessage.belongsTo(User, { foreignKey: 'sender_id', as: 'Sender' });
ChatMessage.belongsTo(User, { foreignKey: 'receiver_id', as: 'Receiver' });

//MarketplaceListing associations
User.hasMany(MarketplaceListing, { foreignKey: 'seller_id', as: 'Listings' });
Item.hasMany(MarketplaceListing, { foreignKey: 'item_id', as: 'Listings' });
MarketplaceListing.belongsTo(User, { foreignKey: 'seller_id', as: 'Seller' });
MarketplaceListing.belongsTo(Item, { foreignKey: 'item_id', as: 'Item' });

// Trade associations
User.hasMany(Trade, { foreignKey: 'sender_id', as: 'SentTrades' });
User.hasMany(Trade, { foreignKey: 'receiver_id', as: 'ReceivedTrades' });
Trade.belongsTo(User, { foreignKey: 'sender_id', as: 'Sender' });
Trade.belongsTo(User, { foreignKey: 'receiver_id', as: 'Receiver' });

// TradeItem associations
Trade.hasMany(TradeItem, { foreignKey: 'trade_id', as: 'Items' });
TradeItem.belongsTo(Trade, { foreignKey: 'trade_id', as: 'Trade' });
Item.hasMany(TradeItem, { foreignKey: 'item_id', as: 'TradeItems' });
TradeItem.belongsTo(Item, { foreignKey: 'item_id', as: 'Item' });

// Wallet associations
User.hasOne(Wallet, { foreignKey: 'user_id', as: 'Wallet' });
Wallet.belongsTo(User, { foreignKey: 'user_id', as: 'User' });

// TrustScore associations
User.hasMany(TrustScore, { foreignKey: 'user_id', as: 'ReceivedTrustScores' });
User.hasMany(TrustScore, { foreignKey: 'rater_id', as: 'GivenTrustScores' });
TrustScore.belongsTo(User, { foreignKey: 'user_id', as: 'RatedUser' });
TrustScore.belongsTo(User, { foreignKey: 'rater_id', as: 'Rater' });

// Notification associations
User.hasMany(Notification, { foreignKey: 'user_id', as: 'Notifications' });
Notification.belongsTo(User, { foreignKey: 'user_id', as: 'User' });

//Profile Associations
User.hasOne(Profile, { foreignKey: 'user_id', as: 'Profile' });
Profile.belongsTo(User, { foreignKey: 'user_id', as: 'User' });

// Note Associations
User.hasMany(Note, { foreignKey: 'user_id', as: 'Notes' });
Note.belongsTo(User, { foreignKey: 'user_id', as: 'User' });


module.exports = { User,
    Inventory, Item, ChatMessage, MarketplaceListing, Trade, TradeItem, Wallet,
    TrustScore, Notification, Profile, Note };
