const { Contact } = require("../models/index");
const { Op } = require("sequelize");

class ContactRepository {

    // async createContact(data){
    //     try {
    //         const response = await Contact.create(data);
    //         return response;
    //     } catch (error) {
    //         console.log("Error at repository layer", error);
    //         throw(error);
    //     }
    // }
    // async getContact(data){
    //     try {
    //         const response = await Contact.findAll(data);
    //         return response;
    //     } catch (error) {
    //         console.log("Error at repository layer", error);
    //         throw(error);
    //     }
    // }

    async findOrCreateContact(email, phoneNumber) {
        try {
            const [contact, created] = await Contact.findOrCreate({
                where: {
                    [Op.or]: [{ email: email }, { phoneNumber: phoneNumber }]
                },
                defaults: {
                    phoneNumber,
                    email,
                    linkedId: null,
                    linkPrecedence: "primary"
                }
            });
            return [contact, created];
        } catch (error) {
            console.log(error);
            throw (error);
        }
    }

};

module.exports = { ContactRepository };