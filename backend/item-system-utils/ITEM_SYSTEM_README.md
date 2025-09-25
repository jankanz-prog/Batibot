# 🎮 Batibot Item System Guide

## 🚀 Quick Setup

### 1. First Time Setup
```bash
# Run this once to create initial rarities and categories
node setup-initial-data.js
```

### 2. Start the Server
```bash
npm run dev
```

### 3. Check if Everything is Working
```bash
# Run this to see database stats and recent items
node debug-item-generation.js
```

## 🎯 Features

### 🔧 Backend Features
- **Automatic Item Generation**: Creates items every minute for all users
- **Admin Item Management**: Full CRUD operations for items, rarities, categories
- **Inventory System**: 30-item limit per user with quantity tracking
- **Weighted Rarities**: 60% common, 20% uncommon, 15% rare, 4% epic, 1% legendary

### 🎨 Frontend Pages
- **`/items`** - Browse all items (public)
- **`/inventory`** - View personal inventory (authenticated users)
- **`/admin`** - Admin management panel (admin users only)

### 🎲 Item Generation
- **Automatic**: Every minute for all users (if inventory not full)
- **Manual**: `POST /api/auth/generate-items` (admin only)
- **Categories**: weapon, armor, accessory, consumable, material, tool, misc
- **Smart Names**: "Divine Sword", "Basic Potion", "Legendary Ring"

## 🔍 Troubleshooting

### No Items Being Generated?
1. Check if rarities exist: `node debug-item-generation.js`
2. If no rarities/categories, run: `node setup-initial-data.js`
3. Check server logs for generation messages every minute

### Users Not Getting Items?
- Users with 30+ items won't get new ones (inventory full)
- Check inventory status with debug script

### Admin Features Not Visible?
- Make sure user has `role: 'admin'` in database
- Register with admin role selected

## 📊 Database Schema

### Items
- `name` - Generated item name
- `description` - Auto-generated description
- `category_id` - Links to ItemCategory
- `rarity_id` - Links to ItemRarity
- `is_tradeable` - Boolean flag

### Rarities
- `name` - common, uncommon, rare, epic, legendary
- `color` - Hex color for UI display
- `weight` - Probability weight for generation

### Categories
- `name` - weapon, armor, accessory, etc.
- `description` - Category description

### Inventory
- `user_id` - Links to User
- `item_id` - Links to Item
- `quantity` - Number of items owned

## 🎮 Example Generated Items

```
"Basic Sword" (common weapon)
"Enhanced Helmet" (uncommon armor)
"Superior Ring" (rare accessory)
"Mythical Potion" (epic consumable)
"Divine Crystal" (legendary material)
```

## 🔧 Utility Scripts

- **`setup-initial-data.js`** - Creates initial rarities and categories
- **`debug-item-generation.js`** - Shows system status and recent items
- **`ITEM_SYSTEM_README.md`** - This guide

Happy item hunting! 🎯✨
