const { ContactRepository } = require("../repositories/contact-respository");

class ContactService {
    constructor() {
        this.contactRepository = new ContactRepository();
    }

    async processContactRequest(email, phoneNumber) {
        const [contact, created] = await this.contactRepository.findOrCreateContact(email, phoneNumber);

        // first case - no match found
        if(created){
            return {
                "contact" : {
                    "primaryContactId": null,
                    "emails": [contact.email],
                    "phoneNumbers":[contact.phoneNumber],
                    "secondaryContactIds": []
                }
            };
        }
    }
};

module.exports = { ContactService };