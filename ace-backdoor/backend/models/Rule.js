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
        allowNull: true,
        references: {
          model: "JavaScriptSnippets",
          key: "id",
        },
      },
      /**
       * NEW FIELD:
       * isActive determines whether the rule is currently active or not.
       */
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      tableName: "rules",
      freezeTableName: true,
    }
  );

  Rule.associate = (models) => {
    Rule.belongsTo(models.JavaScriptSnippet, {
      foreignKey: "scriptId",
      as: "script",
    });
  };

  return Rule;
};
