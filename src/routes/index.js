const { processIdentity } = require("../controllers/identity-controller");

const express = require("express");
const router = express.Router();

router.post("/identity", processIdentity);

module.exports = router;