static async getRecords(req, res) {
  const { id, attrs, date, from, to, interval, filter } = req.query;

  if (!id) return res.status(400).send("id is undefined");
  else if (!ObjectId.isValid(id)) return res.status(400).send("bad id");

  if (!attrs) return res.status(400).send("attrs is undefined");
  else {
    var attrsArr = attrs.split(",");
    if (attrsArr.some((e) => !e.length))
      return res.status(400).send("bad attrs");
  }

  if (interval) {
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
    if (!intervalEnums.includes(interval))
      return res.status(400).send("bad interval");
  }

  if (filter) {
    var filterArr = filter.split(",");
    const filterEnums = [
      "all",
      "avg",
      "count",
      "first",
      "last",
      "max",
      "min",
    ];
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
    let level = fromArr.length < toArr.length ? fromArr.length : toArr.length;
    let wrong = false;
    for (let index = 0; index < level && !wrong; index++) {
      if (fromArr[index] > toArr[index]) wrong = true;
    }
    if (wrong) return res.status(400).send("from is bigger than to");
  }

  try {
    const result = await EntityDAO.getRecordsById({
      id,
      attrs: attrsArr,
      date: dateArr,
      from: fromArr,
      to: toArr,
      interval,
      filter: filterArr,
    });
    return res.json({ data: result });
  } catch (error) {
    console.log(error);
    return res.status(500).send(error.message);
  }
}

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
