const express = require("express");
const router = express.Router();

const RecordDAO = require("../DAOs/record.DAO");
const debug = require("debug")("record.route");

router.get("/", async (req, res) => {
  const { entityId, field, unit, operator } = req.query;

  if (!entityId || !field || !unit || !operator) return res.sendStatus(400);

  try {
    let result = await RecordDAO.findByTimeUnit(
      entityId,
      field,
      unit,
      operator
    );
    return res.json(result);
  } catch (error) {
    debug(error);
    return res.sendStatus(500);
  }
});

router.delete("/", async (req, res) => {
  const { entityId, field } = req.query;

  if (!entityId) return res.sendStatus(400);

  try {
    let result = await RecordDAO.deleteMany(entityId, field);
    return res.json(result);
  } catch (error) {
    debug(error);
    return res.sendStatus(500);
  }
});

module.exports = router;
