const RecordDAO = require("./record.DAO");
const debug = require("debug");
("RecordController");

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
    debug("got here");
    try {
      const { id, attr, date, from, to, interval, filter } = req.query;

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

      if (date) {
        if (from || to)
          return res.status(400).send("from and/or to are redundant");
        var dateArr = date.split(",").map((e) => parseInt(e));
        if (!isValidTimeArray(dateArr)) return res.status(400).send("bad date");
      }

      if (from) {
        var fromArr = from.split(",").map((e) => parseInt(e));
        var fromArrIsValid = isValidTimeArray(fromArr);
        if (!fromArrIsValid) return res.status(400).send("bad from");
      }

      if (to) {
        var toArr = to.split(",").map((e) => parseInt(e));
        var toArrIsValid = isValidTimeArray(toArr);
        if (!toArrIsValid) return res.status(400).send("bad to");
      }

      if (toArrIsValid && fromArrIsValid) {
        let level =
          fromArr.length < toArr.length ? fromArr.length : toArr.length;
        let wrong = false;
        for (let index = 0; index < level && !wrong; index++) {
          if (fromArr[index] > toArr[index]) wrong = true;
        }
        if (wrong) return res.status(400).send("from is bigger than to");
      }

      let result = await RecordDAO.get({
        id,
        attr,
        date: dateArr,
        from: fromArr,
        to: toArr,
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
