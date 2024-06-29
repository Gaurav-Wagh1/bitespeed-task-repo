const { Contact } = require("../models/index");
const { Op, where } = require("sequelize");

class ContactRepository {

    async createContact(data) {
        try {
            const response = await Contact.create(data);
            return response;
        } catch (error) {
            console.log("Error at repository layer", error);
            throw (error);
        }
    }


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

    // async findOrCreateContact(email, phoneNumber) {
    //     try {
    //         const [contact, created] = await Contact.findOrCreate({
    //             where: {
    //                 [Op.or]: [{ email: email }, { phoneNumber: phoneNumber }]
    //             },
    //             defaults: {
    //                 phoneNumber,
    //                 email,
    //                 linkedId: null,
    //                 linkPrecedence: "primary"
    //             }
    //         });
    //         return [contact, created];
    //     } catch (error) {
    //         console.log(error);
    //         throw (error);
    //     }
    // }

};

module.exports = { ContactRepository };