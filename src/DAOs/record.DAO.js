let Record;
const collName = "record";

class RecordDAO {
  static async init(db) {
    const collList = await db
      .listCollections({ name: collName }, { nameOnly: true })
      .toArray();

    if (!collList.length)
      await db.createCollection(collName, {
        timeseries: { timeField: "timestamp", metaField: "metadata" },
      });

    if (!Record) Record = db.collection(collName);

    Record.createIndex({
      "metadata.entityId": 1,
      "metadata.field": 1,
      timestamp: 1,
    });
  }

  static async insertOne(entityId, field, value, timestamp) {
    return await Record.insertOne({
      metadata: { entityId, field },
      timestamp: timestamp ? new Date(timestamp) : new Date(),
      value,
    });
  }

  static async findByTimeUnit(entityId, field, unit, operator, from, to) {
    let pipeline = [
      { $match: { "metadata.entityId": entityId, "metadata.field": field } },
    ];

    if (from)
      pipeline.push({ $match: { timestamp: { $gte: new Date(from) } } });

    if (to) pipeline.push({ $match: { timestamp: { $lte: new Date(to) } } });

    pipeline.push({ $sort: { timestamp: 1 } });

    if (unit && operator)
      if (operator === "integral") {
        if (["year", "quarter", "month"].includes(unit)) {
          //
        } else {
          pipeline.push(
            {
              $setWindowFields: {
                sortBy: { timestamp: 1 },
                output: {
                  integral: {
                    $integral: { input: "$value", unit: unit },
                    window: { range: [-1, 0], unit: unit },
                  },
                },
              },
            },
            {
              $group: {
                _id: {
                  date: { $dateTrunc: { date: "$timestamp", unit: unit } },
                },
                value: { $first: "$integral" },
              },
            },
            { $project: { _id: 0, value: 1, timestamp: "$_id.date" } }
          );
        }
      } else {
        pipeline.push(
          {
            $group: {
              _id: { date: { $dateTrunc: { date: "$timestamp", unit: unit } } },
              value: { ["$" + operator]: operator !== "count" ? "$value" : {} },
            },
          },
          { $project: { _id: 0, value: 1, timestamp: "$_id.date" } }
        );
      }

    pipeline.push({ $sort: { timestamp: 1 } });

    return await Record.aggregate(pipeline).toArray();
  }

  static async deleteMany(entityId, field) {
    return await Record.deleteMany({
      "metadata.entityId": entityId,
      ...(field && { "metadata.field": field }),
    });
  }
}
module.exports = RecordDAO;
