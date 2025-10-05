// models/index.js
// Load models in dependency order (parent tables first)
const ItemRarity = require('./itemRarityModel');
const ItemCategory = require('./itemCategoryModel');
const User = require('./userModel');
const Item = require('./itemModel');
const Inventory = require('./inventoryModel');
const Trade = require('./tradeModel');
const TradeItem = require('./tradeItemModel');
const Wallet = require('./walletModel');
const TrustScore = require('./trustScoreModel');
const Notification = require('./notificationModel');
const Profile = require('./profileModel');
const Note = require('./noteModel');
const ChatMessage = require('./chatMessageModel');

// User Inventory associations
Inventory.belongsTo(User, { foreignKey: 'user_id' });
Inventory.belongsTo(Item, { foreignKey: 'item_id' });
Item.hasMany(Inventory, { foreignKey: 'item_id' });

//Item Associations
Item.belongsTo(ItemRarity, { foreignKey: 'rarity_id', as: 'rarity' });
ItemRarity.hasMany(Item, { foreignKey: 'rarity_id', as: 'Items' });

Item.belongsTo(ItemCategory, { foreignKey: 'category_id', as: 'category' });
ItemCategory.hasMany(Item, { foreignKey: 'category_id', as: 'Items' });

//ChatMessage associations
User.hasMany(ChatMessage, { foreignKey: 'sender_id', as: 'SentMessages' });
User.hasMany(ChatMessage, { foreignKey: 'receiver_id', as: 'ReceivedMessages' });
ChatMessage.belongsTo(User, { foreignKey: 'sender_id', as: 'sender' });
ChatMessage.belongsTo(User, { foreignKey: 'receiver_id', as: 'receiver' });

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


module.exports = {
    User, Inventory, Item, ItemRarity, ItemCategory, ChatMessage,
    Trade, TradeItem, Wallet, TrustScore, Notification, Profile, Note
};
