'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Contact extends Model {
    static associate(models) {
      this.hasMany(models.Contact, { foreignKey: "linkedId" });
      this.belongsTo(models.Contact);
    }
  }
  Contact.init({
    phoneNumber: DataTypes.STRING,
    email: DataTypes.STRING,
    linkedId: DataTypes.INTEGER,
    linkPrecedence: {
      type: DataTypes.ENUM,
      values: ["primary", "secondary"]
    }
  }, {
    sequelize,
    modelName: 'Contact',
  });
  return Contact;
};