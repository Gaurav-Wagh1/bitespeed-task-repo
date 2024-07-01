const { Contact } = require("../models/index");
const { Op } = require("sequelize");

class ContactRepository {

    //---------------------------------------- Method - Create contact with given data;
    async createContact(data) {
        try {
            const response = await Contact.create(data);
            return response;
        } catch (error) {
            console.log("Error at repository layer", error);
            throw (error);
        }
    }

    //---------------------------------------- Method - Get contact with given filter;
    async getContact(filter) {
        try {
            const response = await Contact.findAll({
                where: filter
            });
            return response;
        } catch (error) {
            console.log("Error at repository layer", error);
            throw (error);
        }
    }

    //---------------------------------------- Method - Update given data of contact with given id;
    async updateContact(id, data) {
        try {
            await Contact.update(data, {
                where: {
                    id
                }
            });
        } catch (error) {
            console.log("Error at repository layer", error);
            throw (error);
        }
    }

    //---------------------------------------- Method - Find secondary contacts from primary contact;
    async getSecondaryContacts(primaryContact) {
        try {
            const secondaryContacts = await primaryContact.getContacts();
            return secondaryContacts;
        } catch (error) {
            console.log("Error at repository layer", error);
            throw (error);
        }
    }

    //---------------------------------------- Method - Find primary contact from secondary contacts;
    async getPrimaryContact(secondaryContact) {
        try {
            const primaryContact = await secondaryContact.getContact();
            return primaryContact;
        } catch (error) {
            console.log("Error at repository layer", error);
            throw (error);
        }
    }

};

module.exports = { ContactRepository };