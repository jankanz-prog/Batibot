// migrations/add-enhanced-note-fields.js
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('notes', 'color', {
      type: Sequelize.STRING(50),
      allowNull: true,
      defaultValue: null
    });

    await queryInterface.addColumn('notes', 'priority', {
      type: Sequelize.ENUM('low', 'medium', 'high'),
      allowNull: false,
      defaultValue: 'medium'
    });

    await queryInterface.addColumn('notes', 'pinned', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    });

    await queryInterface.addColumn('notes', 'archived', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    });

    await queryInterface.addColumn('notes', 'tags', {
      type: Sequelize.JSON,
      allowNull: true,
      defaultValue: null
    });

    await queryInterface.addColumn('notes', 'attachments', {
      type: Sequelize.JSON,
      allowNull: true,
      defaultValue: null
    });

    await queryInterface.addColumn('notes', 'drawings', {
      type: Sequelize.JSON,
      allowNull: true,
      defaultValue: null
    });

    await queryInterface.addColumn('notes', 'reminder', {
      type: Sequelize.DATE,
      allowNull: true,
      defaultValue: null
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('notes', 'color');
    await queryInterface.removeColumn('notes', 'priority');
    await queryInterface.removeColumn('notes', 'pinned');
    await queryInterface.removeColumn('notes', 'archived');
    await queryInterface.removeColumn('notes', 'tags');
    await queryInterface.removeColumn('notes', 'attachments');
    await queryInterface.removeColumn('notes', 'drawings');
    await queryInterface.removeColumn('notes', 'reminder');

    // Drop ENUM type for priority (MySQL specific)
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS enum_notes_priority');
  }
};

