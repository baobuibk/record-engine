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

  static async findByTimeUnit(entityId, field, unit, operator) {
    return await Record.aggregate([
      { $match: { "metadata.entityId": entityId, "metadata.field": field } },
      {
        $group: {
          _id: {
            date: { $dateTrunc: { date: "$timestamp", unit: unit } },
          },
          value: {
            ["$" + operator]: operator !== "count" ? "$value" : {},
          },
        },
      },
      {
        $project: {
          _id: 0,
          value: 1,
          timestamp: "$_id.date",
        },
      },
      { $sort: { timestamp: 1 } },
    ]).toArray();
  }

  static async deleteMany(entityId, field) {
    return await Record.deleteMany({
      "metadata.entityId": entityId,
      ...(field && { "metadata.field": field }),
    });
  }
}
module.exports = RecordDAO;
