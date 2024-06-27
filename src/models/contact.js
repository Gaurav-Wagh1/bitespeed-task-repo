'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Contact extends Model {
    static associate(models) {
      this.hasMany(models.Contact, { foreignKey: "linkedId" });
      this.belongsTo(models.Contact, { foreignKey: "linkedId" });
    }
  }
  Contact.init({
    phoneNumber: DataTypes.STRING,
    email: DataTypes.STRING,
    linkedId: DataTypes.INTEGER,
    linkPrecedence: {
      type: DataTypes.ENUM,
      values: ["primary", "secondary"]
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Contact',
    paranoid: true,
    timestamps: true
  });
  return Contact;
};