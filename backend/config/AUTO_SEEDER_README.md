# Auto-Seeder System 🌱

## Overview
The auto-seeder automatically populates the database with initial data when the server starts **only if the tables are empty**. No more manual script running!

## How It Works

### Automatic Seeding
- ✅ Runs automatically on every server startup
- ✅ Checks if `item_rarities` and `item_categories` tables are empty
- ✅ Only seeds if tables are empty (prevents duplicates)
- ✅ Silent when data already exists
- ✅ Non-blocking (server starts even if seeding fails)

### What Gets Seeded

**Rarities (5):**
- Common (60% weight)
- Uncommon (20% weight)
- Rare (15% weight)
- Epic (4% weight)
- Legendary (1% weight)

**Categories (7):**
- Weapon
- Armor
- Accessory
- Consumable
- Material
- Tool
- Misc

## Usage

### Normal Development Flow
```bash
# Just start your server - that's it!
npm run dev
```

**First time:**
```
🌱 Database tables empty, auto-seeding initial data...
   🎯 Seeding rarities...
   ✅ Created 5 rarities
   📦 Seeding categories...
   ✅ Created 7 categories
🎉 Auto-seeding complete! (Rarities: 5, Categories: 7)
```

**Subsequent starts:**
```
✅ Database already seeded (Rarities: 5, Categories: 7)
```

### Manual Seeding (Optional)
If you ever need to manually seed (e.g., after database reset):
```bash
node item-system-utils/setup-initial-data.js
```

## Benefits

### ✅ Developer Experience
- No manual script running required
- Works in development and production
- Self-healing (reseeds if tables become empty)
- Clear console feedback

### ✅ Team Collaboration
- New developers don't need extra setup steps
- Consistent data across all environments
- No "forgot to seed" errors

### ✅ CI/CD Friendly
- Works in automated deployments
- No pre-deployment scripts needed
- Database migrations just work

## Configuration

### Location
- **Module:** `backend/config/autoSeeder.js`
- **Integration:** `backend/app.js` (line ~271)

### Customization
Edit `autoSeeder.js` to add more initial data:
```javascript
// Add more seed data
const newCategories = [
    { name: 'quest', description: 'Quest items' }
];
```

## Troubleshooting

### Seeder Not Running
Check console logs for:
```
❌ Auto-seeding error: [error message]
```

### Data Not Appearing
1. Check database connection
2. Verify models are loaded (`require('./models')`)
3. Run manual seeder for detailed logs

### Want to Re-seed
```bash
# Option 1: Clear tables manually in database
# Option 2: Use force sync (WARNING: deletes all data)
sequelize.sync({ force: true })
```

## Technical Details

### Safety Features
- Idempotent (safe to run multiple times)
- Non-throwing (won't crash server)
- Atomic operations (all or nothing)
- Transaction support (if needed)

### Performance
- Only runs once per startup
- Uses `bulkCreate` for efficiency
- Minimal database queries (2 counts + 2 inserts max)

---

**Created:** Oct 19, 2025  
**Status:** ✅ Production Ready
