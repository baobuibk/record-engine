module.exports = {
  $jsonSchema: {
    bsonType: "object",

    required: ["_id", "entityId", "attr"],

    properties: {
      _id: { bsonType: "objectId" },
      entityId: { bsonType: "objectId" },
      attr: { bsonType: "string" },

      samples: {
        bsonType: "array",
        items: {
          bsonType: "object",
          required: ["v", "t"],
        },
      },
    },
  },
};
