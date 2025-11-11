// update-collect-descriptions.js
// Update achievement/badge descriptions from "collect" to "receive"

const { Badge, Achievement } = require('./models');

async function updateDescriptions() {
    try {
        console.log('🔄 Updating "collect" to "receive" in descriptions...\n');

        // Update Badges
        console.log('📛 Updating Badge descriptions...');
        await Badge.update(
            { description: 'Received your first 10 items' },
            { where: { name: 'Collector' } }
        );
        await Badge.update(
            { description: 'Receive your first legendary item' },
            { where: { name: 'Legendary Finder' } }
        );
        console.log('✅ Updated 2 badges\n');

        // Update Achievements
        console.log('🏆 Updating Achievement descriptions...');
        await Achievement.update(
            { description: 'Receive 10 items' },
            { where: { name: 'Item Hoarder I' } }
        );
        await Achievement.update(
            { description: 'Receive 50 items' },
            { where: { name: 'Item Hoarder II' } }
        );
        await Achievement.update(
            { description: 'Receive 100 items' },
            { where: { name: 'Item Hoarder III' } }
        );
        await Achievement.update(
            { description: 'Receive 1 rare+ item' },
            { where: { name: 'Rare Hunter I' } }
        );
        await Achievement.update(
            { description: 'Receive 10 rare+ items' },
            { where: { name: 'Rare Hunter II' } }
        );
        await Achievement.update(
            { description: 'Receive 50 rare+ items' },
            { where: { name: 'Rare Hunter III' } }
        );
        console.log('✅ Updated 6 achievements\n');

        console.log('🎉 All descriptions updated!');
        console.log('✨ Descriptions now accurately reflect that items are received from the system.\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error updating descriptions:', error);
        process.exit(1);
    }
}

// Run the update
updateDescriptions();
