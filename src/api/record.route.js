const express = require("express");
const router = express.Router();

const RecordController = require("./record.controller");

router.get("/get", RecordController.get);

module.exports = router;
