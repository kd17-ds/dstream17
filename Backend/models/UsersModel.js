const { model } = require("mongoose");

const { UsersSchema } = require("../schema/UsersSchema");

const UsersModel = new model("User", UsersSchema);

module.exports = UsersModel;
