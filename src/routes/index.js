const { processIdentity } = require("../controllers/identity-controller");

const express = require("express");
const router = express.Router();

router.get("/identity", processIdentity);

module.exports = router;