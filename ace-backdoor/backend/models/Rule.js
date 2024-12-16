const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Rule = sequelize.define(
    "Rule",
    {
      url: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      countries: {
        type: DataTypes.JSON,
        allowNull: false,
        validate: {
          isArray(value) {
            if (!Array.isArray(value)) {
              throw new Error("Countries must be an array of country codes.");
            }
          },
        },
      },
      percentage: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 0,
          max: 100,
        },
      },
      scriptId: {
        type: DataTypes.INTEGER,
        allowNull: true, // If a script must always be selected
        references: {
          model: "JavaScriptSnippets", // must match the table name defined in JavaScriptSnippet model
          key: "id",
        },
      },
    },
    {
      tableName: "Rules",
      freezeTableName: true, // prevents Sequelize from pluralizing the table name
    }
  );

  Rule.associate = (models) => {
    // Associate Rule with JavaScriptSnippet
    Rule.belongsTo(models.JavaScriptSnippet, {
      foreignKey: "scriptId",
      as: "script",
    });
  };

  return Rule;
};
