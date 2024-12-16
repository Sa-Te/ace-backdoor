// migrations/XXXXXXXXXXXXXX-add-name-to-javascript-snippet.js
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("JavaScriptSnippets", "name", {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: "Untitled Script",
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("JavaScriptSnippets", "name");
  },
};
