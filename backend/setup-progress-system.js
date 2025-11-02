// setup-progress-system.js
// Run this script to set up the progress system (badges, achievements, ranks)

const sequelize = require('./config/database');
const migration = require('./migrations/add-progress-system');
const { seedProgressData } = require('./seeders/seedProgressData');

async function setupProgressSystem() {
    try {
        console.log('🚀 Starting Progress System Setup...\n');

        // Step 1: Run migration
        console.log('📦 Step 1: Running database migration...');
        await migration.up(sequelize.getQueryInterface(), sequelize.Sequelize);
        console.log('✅ Migration completed!\n');

        // Step 2: Seed initial data
        console.log('🌱 Step 2: Seeding initial data...');
        await seedProgressData();
        console.log('✅ Seeding completed!\n');

        console.log('🎉 Progress System Setup Complete!');
        console.log('\n📝 Summary:');
        console.log('   - Created 5 new database tables');
        console.log('   - Added 4 new columns to profiles table');
        console.log('   - Seeded 14 badges');
        console.log('   - Seeded 18 achievements');
        console.log('   - Seeded 7 ranks');
        console.log('\n✨ You can now restart your server and use the progress system!');
        console.log('📖 Read PROGRESS_SYSTEM_README.md for usage documentation.\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error during setup:', error);
        console.error('\nSetup failed. Please check the error above and try again.');
        process.exit(1);
    }
}

// Run the setup
setupProgressSystem();
