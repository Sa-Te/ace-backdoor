// migrations/20241129194503-add-active-lastActive-to-visitors.js
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if 'active' column exists
    const tableInfo = await queryInterface.describeTable("Visitors");

    if (!tableInfo.lastActive) {
      await queryInterface.addColumn("Visitors", "lastActive", {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW"),
      });
    } else {
      console.log("'lastActive' column already exists, skipping");
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Remove 'lastActive' column
    await queryInterface.removeColumn("Visitors", "lastActive");
  },
};
