module.exports = {
  $jsonSchema: {
    bsonType: "object",

    required: ["_id", "id", "attr"],

    properties: {
      _id: { bsonType: "objectId" },
      id: { bsonType: "string" },
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
