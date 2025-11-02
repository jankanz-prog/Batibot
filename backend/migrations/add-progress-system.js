// migrations/add-progress-system.js
const { DataTypes } = require('sequelize');

module.exports = {
    up: async (queryInterface, Sequelize) => {
        console.log('Starting progress system migration...');

        // Create badges table
        await queryInterface.createTable('badges', {
            badge_id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true
            },
            description: {
                type: DataTypes.TEXT,
                allowNull: false
            },
            icon: {
                type: DataTypes.STRING,
                allowNull: true
            },
            category: {
                type: DataTypes.ENUM('progress', 'activity', 'item', 'rarity', 'social', 'interaction'),
                allowNull: false,
                defaultValue: 'progress'
            },
            rarity: {
                type: DataTypes.ENUM('common', 'rare', 'epic', 'legendary'),
                allowNull: false,
                defaultValue: 'common'
            },
            requirement_type: {
                type: DataTypes.STRING,
                allowNull: false
            },
            requirement_value: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
            createdAt: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            },
            updatedAt: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            }
        });

        // Create achievements table
        await queryInterface.createTable('achievements', {
            achievement_id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true
            },
            description: {
                type: DataTypes.TEXT,
                allowNull: false
            },
            icon: {
                type: DataTypes.STRING,
                allowNull: true
            },
            category: {
                type: DataTypes.ENUM('trading', 'collection', 'engagement', 'misc'),
                allowNull: false,
                defaultValue: 'trading'
            },
            tier: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 1
            },
            requirement_type: {
                type: DataTypes.STRING,
                allowNull: false
            },
            requirement_value: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            xp_reward: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0
            },
            createdAt: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            },
            updatedAt: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            }
        });

        // Create ranks table
        await queryInterface.createTable('ranks', {
            rank_id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true
            },
            symbol: {
                type: DataTypes.STRING,
                allowNull: true
            },
            level: {
                type: DataTypes.INTEGER,
                allowNull: false,
                unique: true
            },
            xp_required: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0
            },
            trades_required: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
            items_required: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
            legendary_items_required: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
            createdAt: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            },
            updatedAt: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            }
        });

        // Create user_badges junction table
        await queryInterface.createTable('user_badges', {
            user_badge_id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            user_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            badge_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'badges',
                    key: 'badge_id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            earned_date: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            }
        });

        // Create user_achievements junction table
        await queryInterface.createTable('user_achievements', {
            user_achievement_id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            user_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            achievement_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'achievements',
                    key: 'achievement_id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            progress: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0
            },
            completed: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false
            },
            completed_date: {
                type: DataTypes.DATE,
                allowNull: true
            },
            createdAt: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            },
            updatedAt: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            }
        });

        // Add indexes
        await queryInterface.addIndex('user_badges', ['user_id', 'badge_id'], {
            unique: true,
            name: 'unique_user_badge'
        });

        await queryInterface.addIndex('user_achievements', ['user_id', 'achievement_id'], {
            unique: true,
            name: 'unique_user_achievement'
        });

        // Add new columns to profiles table
        await queryInterface.addColumn('profiles', 'xp', {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        });

        await queryInterface.addColumn('profiles', 'current_rank_id', {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'ranks',
                key: 'rank_id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL'
        });

        await queryInterface.addColumn('profiles', 'consecutive_login_days', {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        });

        await queryInterface.addColumn('profiles', 'total_login_days', {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        });

        console.log('Progress system migration completed!');
    },

    down: async (queryInterface, Sequelize) => {
        console.log('Rolling back progress system migration...');

        // Remove columns from profiles
        await queryInterface.removeColumn('profiles', 'total_login_days');
        await queryInterface.removeColumn('profiles', 'consecutive_login_days');
        await queryInterface.removeColumn('profiles', 'current_rank_id');
        await queryInterface.removeColumn('profiles', 'xp');

        // Drop tables in reverse order
        await queryInterface.dropTable('user_achievements');
        await queryInterface.dropTable('user_badges');
        await queryInterface.dropTable('ranks');
        await queryInterface.dropTable('achievements');
        await queryInterface.dropTable('badges');

        console.log('Progress system migration rolled back!');
    }
};
