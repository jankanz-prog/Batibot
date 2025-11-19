// cleanup-cardano-table.js - Clean up Cardano transactions table
require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        dialect: 'mysql',
        logging: console.log,
    }
);

async function cleanup() {
    try {
        console.log('🔌 Connecting to database...');
        await sequelize.authenticate();
        console.log('✅ Connected to MySQL');

        console.log('\n🗑️  Dropping cardano_transactions table...');
        await sequelize.query('DROP TABLE IF EXISTS `cardano_transactions`');
        console.log('✅ Table dropped');

        console.log('\n✨ Cleanup complete! You can now restart the backend.');
        console.log('   Run: npm run dev');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Cleanup failed:', error);
        process.exit(1);
    }
}

cleanup();
