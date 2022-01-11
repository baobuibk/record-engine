const RecordDAO = require("./record.DAO");
const debug = require("debug")("RecordController");
const dayjs = require("dayjs");

const intervalEnums = [
  "year",
  "month",
  "day",
  "hour",
  "30m",
  "15m",
  "10m",
  "minute",
  "30s",
  "15s",
  "10s",
  "second",
];

const filterEnums = ["all", "avg", "count", "first", "last", "max", "min"];

class RecordController {
  static async get(req, res) {
    debug(req.query);
    try {
      const { id, attr, from, to, interval, filter } = req.query;

      if (!id) {
        debug("no id");
        return res.status(400).send("id is undefined");
      }

      if (!attr || typeof attr !== "string" || !attr.length)
        return res.status(400).send("bad attr");

      if (interval) {
        if (!intervalEnums.includes(interval))
          return res.status(400).send("bad interval");
      }

      if (filter) {
        var filterArr = filter.split(",");
        if (filterArr.some((e) => !filterEnums.includes(e)))
          return res.status(400).send("bad filter");
      }

      if (
        !from ||
        !to ||
        !dayjs(from).isValid() ||
        !dayjs(to).isValid() ||
        dayjs(from).isAfter(dayjs(to))
      )
        return res.status(400).send("bad from & to");

      let result = await RecordDAO.get({
        id,
        attr,
        from,
        to,
        interval,
        filter: filterArr,
      });
      return res.json(result);
    } catch (error) {
      console.log(error);
      return res.sendStatus(500);
    }
  }
}

module.exports = RecordController;

function isValidTimeArray(timeArr) {
  for (let index = 0; index < timeArr.length; index++) {
    const e = timeArr[index];
    if (isNaN(e)) return false;
    switch (index) {
      case 0: // year
        if (e < 2020) return false;
        break;
      case 1: // month
        if (e < 1 || e > 12) return false;
        break;
      case 2: // day
        if (e < 1 || e > 31) return false;
        break;
      case 3: // hour
        if (e < 0 || e > 23) return false;
        break;
      case 4: // minute
      case 5: // second
        if (e < 0 || e > 59) return false;
        break;
      default:
        return false;
    }
  }
  return true;
}
