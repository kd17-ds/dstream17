const { Schema } = require("mongoose");

const meetingSchema = new Schema({
  user_id: {
    type: String,
  },
  meetingCode: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: new Date(),
  },
});

module.exports = { meetingSchema };
