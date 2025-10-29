// Migration to add is_live_trade column to trades table
const sequelize = require('../config/database');

async function addIsLiveTradeColumn() {
    try {
        console.log('🔄 Adding is_live_trade column to trades table...');
        
        // Add the column
        await sequelize.query(`
            ALTER TABLE trades 
            ADD COLUMN IF NOT EXISTS is_live_trade BOOLEAN NOT NULL DEFAULT FALSE;
        `);
        
        console.log('✅ Successfully added is_live_trade column');
        
        // Show updated table structure
        const [results] = await sequelize.query(`
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns
            WHERE table_name = 'trades'
            ORDER BY ordinal_position;
        `);
        
        console.log('\n📋 Updated trades table structure:');
        console.table(results);
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

addIsLiveTradeColumn();
