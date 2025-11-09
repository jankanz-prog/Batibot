// debug-trade-achievement.js
// Check and manually award trade achievements

const { UserAchievement, Achievement } = require('./models');
const progressService = require('./services/progressService');

async function debugTradeAchievement() {
    try {
        const userId = process.argv[2];
        
        if (!userId) {
            console.log('❌ Please provide a user ID');
            console.log('Usage: node debug-trade-achievement.js <user_id>');
            console.log('Example: node debug-trade-achievement.js 1');
            process.exit(1);
        }

        console.log(`🔍 Checking trade achievements for user ${userId}...\n`);

        // Check Novice Trader achievement
        const noviceTrader = await Achievement.findOne({ where: { name: 'Novice Trader' } });
        
        if (!noviceTrader) {
            console.log('❌ "Novice Trader" achievement not found in database!');
            process.exit(1);
        }

        console.log('✅ Found "Novice Trader" achievement:');
        console.log(`   ID: ${noviceTrader.achievement_id}`);
        console.log(`   Requirement: ${noviceTrader.requirement_value} trades`);
        console.log(`   XP Reward: ${noviceTrader.xp_reward} XP\n`);

        // Check user's progress
        const userProgress = await UserAchievement.findOne({
            where: { 
                user_id: userId, 
                achievement_id: noviceTrader.achievement_id 
            }
        });

        if (!userProgress) {
            console.log('⚠️ User has no progress on this achievement yet.');
            console.log('   Creating and awarding now...\n');
        } else {
            console.log('📊 Current progress:');
            console.log(`   Progress: ${userProgress.progress}/${noviceTrader.requirement_value}`);
            console.log(`   Completed: ${userProgress.completed}`);
            console.log(`   Completed Date: ${userProgress.completed_date || 'N/A'}\n`);
        }

        // Manually award the achievement
        console.log('🎯 Awarding "Novice Trader" achievement...');
        const result = await progressService.updateAchievement(userId, 'Novice Trader', 1);
        
        if (result) {
            console.log('\n✅ Successfully awarded!');
            console.log(`   New Progress: ${result.progress}/${noviceTrader.requirement_value}`);
            console.log(`   Completed: ${result.completed}`);
            
            if (result.completed) {
                console.log(`   🎉 Achievement unlocked! +${noviceTrader.xp_reward} XP`);
            }
        } else {
            console.log('\n❌ Failed to award achievement');
        }

        // Also award Trader badge
        console.log('\n🏅 Checking "Trader" badge...');
        await progressService.awardBadge(userId, 'Trader');

        console.log('\n💡 Refresh your dashboard to see the changes!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

// Run the debug
debugTradeAchievement();
