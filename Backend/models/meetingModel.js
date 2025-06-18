const { model } = require("mongoose");

const { meetingSchema } = require("../schema/meetingSchema");

const meetingModel = new model("Meeting", meetingSchema);

module.exports = meetingModel;
