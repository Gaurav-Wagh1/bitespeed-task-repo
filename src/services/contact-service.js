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
        if (!contacts.length && (email && phoneNumber)) {
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
            // return {
            //     "contact": {
            //         "primaryContactId": recursiveResponse.filter(resp => resp.linkPrecedence == "primary").map(resp => resp.id),
            //         "emails": recursiveResponse.map(resp => resp.email).filter((value, index, self) => self.indexOf(value) === index),
            //         "phoneNumbers": recursiveResponse.map(resp => resp.phoneNumber).filter((value, index, self) => self.indexOf(value) === index),
            //         "secondaryContactIds": recursiveResponse.filter(resp => resp.linkPrecedence == "secondary").map(resp => resp.id)
            //     }
            // };
            return this.#returnData(recursiveResponse);
        }

        // case - other
        const primaryContact = contacts.filter(contact => contact.linkPrecedence == "primary");

        if (email && phoneNumber) {
            if (primaryContact.length == 1) {
                await this.contactRepository.createContact({
                    phoneNumber,
                    email,
                    linkedId: primaryContact[0].id,
                    linkPrecedence: "secondary"
                });
            }
            else {
                const sortedPrimaryContacts = primaryContact.sort((a, b) => a.id - b.id);
                const firstPrimaryContact = sortedPrimaryContacts[0];
                const secondPrimaryContact = sortedPrimaryContacts[1];
                await this.contactRepository.updateContact(secondPrimaryContact.id, { linkedId: firstPrimaryContact.id, linkPrecedence: "secondary" });
            }
            const recursiveResponse = await this.processRecursiveCalls(email, "email");
            return this.#returnData(recursiveResponse);
        }
        else {
            let recursiveResponse;
            if (email) {
                recursiveResponse = await this.processRecursiveCalls(email, "email");
            }
            else {
                recursiveResponse = await this.processRecursiveCalls(phoneNumber, "phoneNumber");
            }
            return this.#returnData(recursiveResponse);
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

    #returnData(recursiveResponse) {
        return {
            "contact": {
                "primaryContactId": recursiveResponse.filter(resp => resp.linkPrecedence == "primary").map(resp => resp.id),
                "emails": recursiveResponse.sort((a, b) => a.id - b.id).map(resp => resp.email).filter((value, index, self) => self.indexOf(value) === index),
                "phoneNumbers": recursiveResponse.sort((a, b) => a.id - b.id).map(resp => resp.phoneNumber).filter((value, index, self) => self.indexOf(value) === index),
                "secondaryContactIds": recursiveResponse.sort((a, b) => a.id - b.id).filter(resp => resp.linkPrecedence == "secondary").map(resp => resp.id)
            }
        }
    }
};

module.exports = { ContactService };