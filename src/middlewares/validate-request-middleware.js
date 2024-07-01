//---------------------------------------- Middleware to validate request
const validateRequest = (req, res, next) => {
    if (!req.body.email && !req.body.phoneNumber) {
        return res.json({
            error: "provide valid email & phoneNumber in JSON body"
        });
    }
    next();
}

module.exports = { validateRequest }