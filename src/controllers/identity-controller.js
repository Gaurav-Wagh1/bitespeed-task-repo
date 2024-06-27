const { ContactService } = require("../services/contact-service");

const contactService = new ContactService();

const processIdentity = async (req, res) => {
    try {
        const response = await contactService.processContactRequest(req.email, req.phoneNumber);
        return res.json(response);
    } catch (error) {
        return res.json({
            data: {},
            success: false,
            error: error,
            message: "Something went wrong!"
        });
    }
};

module.exports = {
    processIdentity
};