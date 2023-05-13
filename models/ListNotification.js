const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const listNotification = sequelize.define("listnotifications", {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
  message: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
});

module.exports = listNotification;
