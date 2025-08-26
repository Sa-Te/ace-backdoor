const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const JavaScriptSnippet = sequelize.define(
    "JavaScriptSnippet",
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Script name cannot be empty.",
          },
        },
      },
      script: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Script content cannot be empty.",
          },
        },
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      tableName: "JavaScriptSnippets", // explicitly define table name
      freezeTableName: true, // prevents Sequelize from pluralizing the table name
    }
  );

  return JavaScriptSnippet;
};
