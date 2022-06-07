const express = require("express");
const router = express.Router();

const RecordDAO = require("../DAOs/record.DAO");
const debug = require("debug")("record.route");

const unitSet = new Set([
  "year",
  "quarter",
  "month",
  "week",
  "day",
  "hour",
  "minute",
  "second",
  "millisecond",
]);
const opSet = new Set([
  "avg",
  "count",
  "first",
  "last",
  "max",
  "min",
  "integral",
  "derivative",
]);

router.post("/", async (req, res) => {
  const { entityId, field } = req.query;
  const { value, timestamp } = req.body;

  try {
    let result = RecordDAO.insertOne(entityId, field, value, timestamp);
    return res.json(result);
  } catch (error) {
    debug(error);
    return res.sendStatus(500);
  }
});

router.get("/", async (req, res) => {
  const { entityId, field, unit, operator, from, to } = req.query;

  // check for availablility of fields
  if (!entityId || !field || (unit && !operator) || (!unit && operator))
    return res.sendStatus(400);

  // check for validity of fields
  if ((unit && !unitSet.has(unit)) || (operator && !opSet.has(operator)))
    return res.sendStatus(400);

  try {
    let result = await RecordDAO.findByTimeUnit(
      entityId,
      field,
      unit,
      operator,
      from,
      to
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

router.get("/clean", async (req, res) => {
  try {
    return res.sendStatus(200);
  } catch (error) {
    debug(error);
    return res.sendStatus(500);
  }
});

module.exports = router;
