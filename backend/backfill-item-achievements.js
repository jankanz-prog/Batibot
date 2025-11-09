// backfill-item-achievements.js
// Award item collection achievements based on existing inventory

const { User } = require('./models');
const progressService = require('./services/progressService');

async function backfillItemAchievements() {
    try {
        console.log('🔄 Backfilling item collection achievements...\n');

        // Get all users
        const users = await User.findAll({
            attributes: ['id', 'username']
        });

        console.log(`Found ${users.length} users to process\n`);

        let successCount = 0;
        let errorCount = 0;

        for (const user of users) {
            try {
                console.log(`Processing user: ${user.username} (ID: ${user.id})...`);
                
                // Award item collection achievements
                // This will check their current inventory count and update achievements accordingly
                await progressService.onItemCollect(user.id);
                
                successCount++;
                console.log(`✅ Successfully processed ${user.username}\n`);
            } catch (error) {
                errorCount++;
                console.error(`❌ Error processing ${user.username}:`, error.message);
            }
        }

        console.log('\n' + '='.repeat(50));
        console.log('🎉 Backfill Complete!');
        console.log('='.repeat(50));
        console.log(`✅ Successfully processed: ${successCount} users`);
        console.log(`❌ Errors: ${errorCount} users`);
        console.log('\n📝 Summary:');
        console.log('   - Item Hoarder achievements updated based on inventory count');
        console.log('   - Collector badge awarded to users with 10+ items');
        console.log('   - Treasure Hoarder badge awarded to users with 50+ items');
        console.log('\n💡 Tip: Users may need to refresh their dashboard to see the new achievements!\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Fatal error during backfill:', error);
        process.exit(1);
    }
}

// Run the backfill
backfillItemAchievements();
