const { validateRequest } = require("../middlewares/validate-request-middleware");

const { processIdentity } = require("../controllers/identity-controller");

const express = require("express");
const router = express.Router();

router.post("/identity", validateRequest, processIdentity);

module.exports = router;