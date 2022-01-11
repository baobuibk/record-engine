const Schema = require("./record.schema");
const dayjs = require("dayjs");

let Record;
const collName = "record";

class RecordDAO {
  static async init(db) {
    const collList = await db
      .listCollections({ name: collName }, { nameOnly: true })
      .toArray();

    if (collList.length)
      await db.command({ collMod: collName, validator: Schema });
    else await db.createCollection(collName, { validator: Schema });

    if (!Record) Record = db.collection(collName);
  }

  // Add one sample
  static async addOneSample(id, attr, sample) {
    if (Object.prototype.toString.call(sample.t) === "[object Date]") {
      // it is a date
      if (isNaN(sample.t.getTime())) {
        // d.valueOf() could also work
        // date is not valid
        sample.t = new Date();
      } else {
        // date is valid
      }
    } else {
      // not a date
      sample.t = new Date();
    }

    const millis = sample.t.getTime();
    const roundToHour = new Date(millis - (millis % 3600000));

    const filter = {
      id,
      attr,
      date: roundToHour,
      count: { $lt: 10 },
    };
    const update = {
      $push: { samples: { $each: [sample], $sort: { t: 1 } } },
      $inc: { count: 1 },
    };
    const options = { upsert: true };
    const { result } = await Record.updateOne(filter, update, options);
    return { ok: 1, status: "ok" };
  }

  static async get(props) {
    try {
      const { id, attr, from, to, interval, filter } = props;

      if (!from || !to) throw new Error("bad from & to");

      let matchDate = {
        $gte: dayjs(from).toDate(),
        $lte: dayjs(to).toDate(),
      };

      const groupObj = {};
      const projectObj = {};
      if (filter)
        for (const e of filter) {
          groupObj[e] = filterObj[e];
          projectObj[e] = 1;
        }
      else {
        groupObj["count"] = filterObj["count"];
        projectObj["count"] = 1;
      }

      const aggs = [
        { $match: { id, attr, date: matchDate } },
        { $unwind: "$samples" },
        { $project: { _id: 0, sample: "$samples", t: "$samples.t" } },
        { $sort: { t: 1 } },
        {
          $project: {
            sample: 1,
            time: interval ? intervalObj[interval] : intervalObj["day"],
          },
        },
        { $group: { _id: "$time", ...groupObj } },
        { $sort: { _id: 1 } },
        { $project: { _id: 0, time: "$_id", ...projectObj } },
      ];

      const result = await Record.aggregate(aggs).toArray();
      return result;
    } catch (error) {
      throw error;
    }
  }

  // Get records for entity with specific id
}
module.exports = RecordDAO;

const filterObj = {
  all: { $push: "$sample" },
  avg: { $avg: "$sample.v" },
  count: { $sum: 1 },
  first: { $first: "$sample" },
  last: { $last: "$sample" },
  max: { $max: "$sample" },
  min: { $min: "$sample" },
};

const intervalObj = {
  year: { $dateToString: { date: "$t", format: "%Y-01-01T00:00:00.000Z" } },
  month: { $dateToString: { date: "$t", format: "%Y-%m-01T00:00:00.000Z" } },
  day: { $dateToString: { date: "$t", format: "%Y-%m-%dT00:00:00.000Z" } },
  hour: {
    $dateToString: { date: "$t", format: "%Y-%m-%dT%H:00:00.000Z" },
  },
  "30m": {
    $concat: [
      {
        $dateToString: { date: "$t", format: "%Y-%m-%dT%H:" },
      },
      {
        $cond: [
          { $eq: [{ $floor: { $divide: [{ $minute: "$t" }, 30] } }, 0] },
          "00",
          {
            $toString: {
              $multiply: [{ $floor: { $divide: [{ $minute: "$t" }, 30] } }, 30],
            },
          },
        ],
      },
      ":00.000Z",
    ],
  },
  "15m": {
    $concat: [
      {
        $dateToString: { date: "$t", format: "%Y-%m-%dT%H:" },
      },
      {
        $cond: [
          { $eq: [{ $floor: { $divide: [{ $minute: "$t" }, 15] } }, 0] },
          "00",
          {
            $toString: {
              $multiply: [{ $floor: { $divide: [{ $minute: "$t" }, 15] } }, 15],
            },
          },
        ],
      },
      ":00.000Z",
    ],
  },
  "10m": {
    $concat: [
      {
        $dateToString: { date: "$t", format: "%Y-%m-%dT%H:" },
      },
      {
        $cond: [
          { $eq: [{ $floor: { $divide: [{ $minute: "$t" }, 10] } }, 0] },
          "00",
          {
            $toString: {
              $multiply: [{ $floor: { $divide: [{ $minute: "$t" }, 10] } }, 10],
            },
          },
        ],
      },
      ":00.000Z",
    ],
  },
  minute: {
    $dateToString: {
      date: "$t",
      format: "%Y-%m-%dT%H:%M:00.000Z",
    },
  },
  "30s": {
    $concat: [
      {
        $dateToString: {
          date: "$t",
          format: "%Y-%m-%dT%H:%M:",
        },
      },
      {
        $cond: [
          { $eq: [{ $floor: { $divide: [{ $second: "$t" }, 30] } }, 0] },
          "00",
          {
            $toString: {
              $multiply: [{ $floor: { $divide: [{ $second: "$t" }, 30] } }, 30],
            },
          },
        ],
      },
      ".000Z",
    ],
  },
  "15s": {
    $concat: [
      {
        $dateToString: {
          date: "$t",
          format: "%Y-%m-%dT%H:%M:",
        },
      },
      {
        $cond: [
          { $eq: [{ $floor: { $divide: [{ $second: "$t" }, 15] } }, 0] },
          "00",
          {
            $toString: {
              $multiply: [{ $floor: { $divide: [{ $second: "$t" }, 15] } }, 15],
            },
          },
        ],
      },
      ".000Z",
    ],
  },
  "10s": {
    $concat: [
      {
        $dateToString: {
          date: "$t",
          format: "%Y-%m-%dT%H:%M:",
        },
      },
      {
        $cond: [
          { $eq: [{ $floor: { $divide: [{ $second: "$t" }, 10] } }, 0] },
          "00",
          {
            $toString: {
              $multiply: [{ $floor: { $divide: [{ $second: "$t" }, 10] } }, 10],
            },
          },
        ],
      },
      ".000Z",
    ],
  },
  second: {
    $dateToString: { date: "$t", format: "%Y-%m-%dT%H:%M:%S.000Z" },
  },
};
