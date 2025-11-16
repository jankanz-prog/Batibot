// models/index.js
const User = require('./userModel');
const Inventory = require('./inventoryModel');
const Item = require('./itemModel');
const Trade = require('./tradeModel');
const TradeItem = require('./tradeItemModel');
const Wallet = require('./walletModel');
const TrustScore = require('./trustScoreModel');
const Notification = require('./notificationModel');
const Profile = require('./profileModel');
const Note = require('./noteModel');
const ChatMessage = require('./chatMessageModel');
const ItemRarity = require('./itemRarityModel');
const ItemCategory = require('./itemCategoryModel');
const Badge = require('./badgeModel');
const Achievement = require('./achievementModel');
const Rank = require('./rankModel');
const UserBadge = require('./userBadgeModel');
const UserAchievement = require('./userAchievementModel');
const CardanoTransaction = require('./cardanoTransactionModel');

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

// Badge Associations
User.belongsToMany(Badge, { through: UserBadge, foreignKey: 'user_id', as: 'Badges' });
Badge.belongsToMany(User, { through: UserBadge, foreignKey: 'badge_id', as: 'Users' });
UserBadge.belongsTo(User, { foreignKey: 'user_id', as: 'User' });
UserBadge.belongsTo(Badge, { foreignKey: 'badge_id', as: 'Badge' });

// Achievement Associations
User.belongsToMany(Achievement, { through: UserAchievement, foreignKey: 'user_id', as: 'Achievements' });
Achievement.belongsToMany(User, { through: UserAchievement, foreignKey: 'achievement_id', as: 'Users' });
UserAchievement.belongsTo(User, { foreignKey: 'user_id', as: 'User' });
UserAchievement.belongsTo(Achievement, { foreignKey: 'achievement_id', as: 'Achievement' });

// Rank Associations
Profile.belongsTo(Rank, { foreignKey: 'current_rank_id', as: 'CurrentRank' });
Rank.hasMany(Profile, { foreignKey: 'current_rank_id', as: 'Profiles' });

// Cardano Transaction Associations
User.hasMany(CardanoTransaction, { foreignKey: 'sender_user_id', as: 'SentTransactions' });
User.hasMany(CardanoTransaction, { foreignKey: 'receiver_user_id', as: 'ReceivedTransactions' });
CardanoTransaction.belongsTo(User, { foreignKey: 'sender_user_id', as: 'SenderUser' });
CardanoTransaction.belongsTo(User, { foreignKey: 'receiver_user_id', as: 'ReceiverUser' });

module.exports = {
    User, Inventory, Item, ItemRarity, ItemCategory, ChatMessage,
    Trade, TradeItem, Wallet, TrustScore, Notification, Profile, Note,
    Badge, Achievement, Rank, UserBadge, UserAchievement, CardanoTransaction
};
