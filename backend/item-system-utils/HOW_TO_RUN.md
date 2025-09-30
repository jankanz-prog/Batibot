# 🚀 How to Run Item System Utilities

## 📍 Important: Run from Backend Directory

**Always run these commands from the `backend/` directory:**

```bash
cd backend
```

---

## 🔧 Setup Initial Data (First Time Only)

Creates rarities and categories needed for item generation.

```bash
node item-system-utils/setup-initial-data.js
```

**What it does:**
- Creates 5 rarities: common, uncommon, rare, epic, legendary
- Creates 7 categories: weapon, armor, accessory, consumable, material, tool, misc
- Safe to run multiple times (won't create duplicates)

**Expected output:**
```
🔗 Connected to database
🎯 Creating rarities...
   ✅ Created rarity: common (#9CA3AF)
   ✅ Created rarity: uncommon (#10B981)
   ...
📦 Creating categories...
   ✅ Created category: weapon
   ...
📊 Setup Complete:
   Rarities: 5
   Categories: 7
```

---

## 🔍 Debug Item Generation

Check if item generation is working and view inventory status.

```bash
node item-system-utils/debug-item-generation.js
```

**What it shows:**
- Total counts (users, items, inventory entries, rarities, categories)
- Recent items generated in last 5 minutes
- User inventory status (active items + deleted items)
- Warnings if rarities/categories are missing

**Expected output:**
```
🔍 Checking Item Generation Status...

📊 Database Overview:
   Users: 2
   Items: 15
   Inventory Entries: 10
   Rarities: 5
   Categories: 7

🕐 Recent Items (Last 5 minutes):
   10:05:30 AM - rare weapon: "Superior Sword"
   10:04:15 AM - common consumable: "Basic Potion"

🎒 User Inventory Status (Active Items):
   jankin: 5/30 items | 🗑️ 2 deleted
   jankan: 3/30 items

✅ Check complete!
```

---

## 📝 Quick Reference

### From Backend Directory:

```bash
# Setup (first time)
node item-system-utils/setup-initial-data.js

# Check status
node item-system-utils/debug-item-generation.js

# Start server
npm run dev
```

### Common Issues:

**"Cannot find module" error:**
- Make sure you're in the `backend/` directory
- Run: `cd backend` first

**"No rarities found" error:**
- Run the setup script first
- `node item-system-utils/setup-initial-data.js`

**Items not generating:**
- Check if rarities/categories exist (run debug script)
- Check if users have space (30-item limit)
- Look at server logs for detailed errors

---

## 🎯 Soft Delete System

The debug script now shows:
- **Active items**: Count toward 30-item limit
- **Deleted items**: Don't count toward limit, shown with 🗑️ icon

Example:
```
jankin: 28/30 items | 🗑️ 5 deleted
```
This user has 28 active items and 5 deleted items (can restore if space available).

---

## 💡 Tips

1. **Always run from backend directory** - The scripts use relative paths
2. **Run setup first** - Before starting the server for the first time
3. **Use debug script** - To troubleshoot item generation issues
4. **Check server logs** - For real-time generation messages every minute

---

**Last Updated:** 2025-09-30
