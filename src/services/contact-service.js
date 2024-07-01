const { Op } = require("sequelize");
const { ContactRepository } = require("../repositories/contact-respository");

class ContactService {
    constructor() {
        this.contactRepository = new ContactRepository();
    }

    //---------------------------------------- Method (Main) - Main method to process request;
    async processContactRequest(email = "", phoneNumber = "") {

        let contacts = await this.contactRepository.getContact({        // find contacts with given email and phoneNumber;
            [Op.or]: [{ email: email }, { phoneNumber: phoneNumber }]
        });

        //---------------------------------------- Case - no match found, primary contact will be created;
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

        //---------------------------------------- Case - No match found and only email or phoneNumber is given, no need to create contact due to insufficient data;
        if (!contacts.length && (email || phoneNumber)) {
            return {
                "contact": {
                    "primaryContactId": null,
                    "emails": [],
                    "phoneNumbers": [],
                    "secondaryContactIds": []
                }
            };
        }

        //---------------------------------------- Case - Email and phone both are matching, no need to create contact in table;
        const foundContacts = contacts.filter(contact => contact.email == email && contact.phoneNumber == phoneNumber);

        if (foundContacts.length) {
            return this.#returnData(await this.#fetchData(email, "email"));
        }

        //---------------------------------------- Case - Both email and phoneNumber are valid;
        if (email && phoneNumber) {
            const contactsFoundThroughEmail = contacts.filter(contact => contact.email == email);
            const contactsFoundThroughPhone = contacts.filter(contact => contact.phoneNumber == phoneNumber);

            //---------------------------------------- Sub-case - primary contact turn into secondary;
            if (contactsFoundThroughEmail.length && contactsFoundThroughPhone.length) {
                const primaryContactThroughEmail = await this.#findPrimaryContact(contactsFoundThroughEmail);
                const primaryContactThroughPhone = await this.#findPrimaryContact(contactsFoundThroughPhone);

                const firstPrimaryContact = primaryContactThroughEmail.id < primaryContactThroughPhone.id ? primaryContactThroughEmail : primaryContactThroughPhone;
                const secondPrimaryContact = primaryContactThroughEmail.id > primaryContactThroughPhone.id ? primaryContactThroughEmail : primaryContactThroughPhone;

                //---------------------------------------- Sub-case - already primary contact converted into secondary, no need to do it again;
                if (firstPrimaryContact == secondPrimaryContact) {
                    return this.#returnData(await this.#fetchData(firstPrimaryContact.email, "email"));
                }

                //---------------------------------------- Sub-case - conversion into secondary;
                const secondaryContacts = await this.contactRepository.getSecondaryContacts(secondPrimaryContact);

                await Promise.all([secondPrimaryContact, ...secondaryContacts].map(async contact => {
                    return this.contactRepository.updateContact(contact.id,
                        { linkedId: firstPrimaryContact.id, linkPrecedence: "secondary" }
                    );;
                }));

                return this.#returnData(await this.#fetchData(firstPrimaryContact.email, "email"));
            }//---------------------------------------- Sub-case - creation of secondary contact;
            else {
                const validRequestField = contactsFoundThroughEmail.length ? "email" : "phoneNumber";
                const primaryContact = validRequestField == "email"
                    ? await this.#findPrimaryContact(contactsFoundThroughEmail)
                    : await this.#findPrimaryContact(contactsFoundThroughPhone);

                await this.contactRepository.createContact({
                    phoneNumber,
                    email,
                    linkedId: primaryContact.id,
                    linkPrecedence: "secondary"
                });

                return this.#returnData(await this.#fetchData(primaryContact.email, "email"));
            }
        }//---------------------------------------- Case - Email or phoneNumber is valid, just return their respective contacts;
        else {
            return email ? this.#returnData(await this.#fetchData(email, "email")) : this.#returnData(await this.#fetchData(phoneNumber, "phoneNumber"));
        }
    }

    //---------------------------------------- Method - Fetch primary contact and all its secondary contacts;
    async #fetchData(field, fieldType) {
        const fieldObjs = await this.contactRepository.getContact({         // fetch contacts based on given email / phoneNumber;
            [fieldType]: field
        });

        const primaryContact = await this.#findPrimaryContact(fieldObjs);   // find primary contact of given array of contacts;

        const secondaryContacts = await this.contactRepository.getSecondaryContacts(primaryContact);         // finding all secondary contacts from primary contact; 

        return { primaryContact, secondaryContacts }
    }

    //---------------------------------------- Method (Private) - Return data in proper format;
    #returnData({ primaryContact, secondaryContacts }) {
        return {
            "contact": {
                "primaryContactId": primaryContact.id,
                "emails": [primaryContact.email, ...secondaryContacts.map(contact => contact.email)].filter((value, index, self) => self.indexOf(value) === index),
                "phoneNumbers": [primaryContact.phoneNumber, ...secondaryContacts.map(contact => contact.phoneNumber)].filter((value, index, self) => self.indexOf(value) === index),
                "secondaryContactIds": secondaryContacts.map(contact => contact.id)
            }
        }
    }

    //---------------------------------------- Method (Private) - Find our primary contact of contacts given in array;
    async #findPrimaryContact(arrayOfContacts) {
        let primaryContact = arrayOfContacts.filter(contact => contact.linkPrecedence == "primary");      // find primary contact from fetched contacts;

        if (primaryContact.length == 0) {                                    // if no primary contact found in fetched contacts,
            primaryContact = await this.contactRepository.getPrimaryContact(arrayOfContacts[0]);               // find it by using any secondary contact;
        }
        else {
            primaryContact = primaryContact[0];                             // if primary contact found in fetched contacts, 
        }                                                                   // get its object from array using index;

        return primaryContact;
    }
};

module.exports = { ContactService };