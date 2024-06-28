const { Op } = require("sequelize");
const { ContactRepository } = require("../repositories/contact-respository");

class ContactService {
    constructor() {
        this.contactRepository = new ContactRepository();
    }

    async processContactRequest(email, phoneNumber) {
        let contacts = await this.contactRepository.getContact({
            [Op.or]: [{ email: email }, { phoneNumber: phoneNumber }]
        });

        // first case - no match found
        // for this case, first create the contact then return it;
        if (!contacts.length) {
            const contact = await this.contactRepository.createContact({
                phoneNumber,
                email,
                linkedId: null,
                linkPrecedence: "primary"
            });
            return {
                "contact": {
                    "primaryContactId": null,
                    "emails": [contact.email],
                    "phoneNumbers": [contact.phoneNumber],
                    "secondaryContactIds": []
                }
            };
        }

        // case - email and phone both are matching, no need to create row in table;
        const foundContacts = contacts.filter(contact => contact.email == email && contact.phoneNumber == phoneNumber);
        if (foundContacts.length) {
            const recursiveResponse = await this.processRecursiveCalls(email, "email");
            return {
                "contact": {
                    "primaryContactId": recursiveResponse.filter(resp => resp.linkPrecedence == "primary").map(resp => resp.id),
                    "emails": recursiveResponse.map(resp => resp.email).filter((value, index, self) => self.indexOf(value) === index),
                    "phoneNumbers": recursiveResponse.map(resp => resp.phoneNumber).filter((value, index, self) => self.indexOf(value) === index),
                    "secondaryContactIds": recursiveResponse.filter(resp => resp.linkPrecedence == "secondary").map(resp => resp.id)
                }
            };
        }


        // case - other
        const primaryContact = contacts.filter(contact => contact.linkPrecedence == "primary");

        if (email && phoneNumber) {
            await this.contactRepository.createContact({
                phoneNumber,
                email,
                linkedId: primaryContact[0].id,
                linkPrecedence: "secondary"
            });

            contacts = await this.contactRepository.getContact({
                [Op.or]: [{ email: email }, { phoneNumber: phoneNumber }]
            });
        }
        else {
            let recursiveResponse;
            if (email) {
                recursiveResponse = await this.processRecursiveCalls(email, "email");
            }
            else {
                recursiveResponse = await this.processRecursiveCalls(phoneNumber, "phoneNumber");
            }
            return recursiveResponse;
        }
    }

    async processRecursiveCalls(data, fieldType, dataField = "") {
        const responses = await this.contactRepository.getContact({ [fieldType]: data });

        let output;
        if (fieldType == "phoneNumber") {
            output = responses.filter(respo => respo.email != dataField);
        }
        else {
            output = responses.filter(respo => respo.phoneNumber != dataField);
        }

        if (output.length == 0) {
            return [];
        }

        const dataToAdd = await Promise.all(output.map(async op => {
            return this.processRecursiveCalls(fieldType == "email" ? op.phoneNumber : op.email,
                fieldType == "email" ? "phoneNumber" : "email",
                data
            );
        }));

        const flattenedDataToAdd = dataToAdd.flat();

        return [...output, ...flattenedDataToAdd];
    }
};

module.exports = { ContactService };