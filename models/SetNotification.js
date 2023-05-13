const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const setNotification = sequelize.define("setnotifications", {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
  minimum: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  maximum: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

module.exports = setNotification;
