// backfill-registration-achievements.js
// Award First Steps and First Mistake to existing users

const { User, Profile } = require('./models');
const progressService = require('./services/progressService');

async function backfillRegistrationAchievements() {
    try {
        console.log('🔄 Backfilling registration achievements for existing users...\n');

        // Get all users
        const users = await User.findAll({
            include: [{ model: Profile, as: 'Profile' }]
        });

        console.log(`Found ${users.length} users to process\n`);

        let successCount = 0;
        let errorCount = 0;

        for (const user of users) {
            try {
                console.log(`Processing user: ${user.username} (ID: ${user.id})...`);
                
                // Award registration achievements
                await progressService.onUserRegister(user.id);
                
                successCount++;
                console.log(`✅ Successfully awarded to ${user.username}\n`);
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
        console.log('   - First Steps badge awarded to eligible users');
        console.log('   - First Mistake achievement awarded to all users');
        console.log('   - 10 XP granted per user');
        console.log('\n💡 Tip: Existing users may need to refresh their dashboard to see the new achievements!\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Fatal error during backfill:', error);
        process.exit(1);
    }
}

// Run the backfill
backfillRegistrationAchievements();
