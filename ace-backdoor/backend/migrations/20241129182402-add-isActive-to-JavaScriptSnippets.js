// migrations/XXXXXXXXXXXXXX-add-isActive-to-JavaScriptSnippets.js
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("JavaScriptSnippets", "isActive", {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("JavaScriptSnippets", "isActive");
  },
};
