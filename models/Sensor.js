const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Sensor = sequelize.define("sensors", {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
  value: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  dateInsert: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
});

module.exports = Sensor;
