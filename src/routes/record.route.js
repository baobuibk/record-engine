const express = require("express");
const router = express.Router();

const RecordDAO = require("../DAOs/record.DAO");
const debug = require("debug")("record.route");

router.get("/", async (req, res) => {
  const { entityId, field, unit, operator } = req.query;

  try {
    let result = await RecordDAO.findByTimeUnit(
      Number(entityId),
      field,
      unit,
      operator
    );
    return res.json(result);
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
});

module.exports = router;
