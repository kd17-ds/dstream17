const { Schema } = require("mongoose");
const bcrypt = require("bcrypt"); // Bcrypt is used to hash passwords securely

const UsersSchema = new Schema({
  email: {
    type: String,
    required: [true, "Your email address is required"],
    unique: true,
  },
  username: {
    type: String,
    required: [true, "Your username is required"],
  },
  password: {
    type: String,
    required: [true, "Your password is required"],
  },
  createdAt: {
    type: Date,
    default: new Date(),
  },
});

// Mongoose Middleware - runs **before saving** a user to the database
UsersSchema.pre("save", async function () {
  // Bcrypt hashes the password with a salt of 12 rounds
  this.password = await bcrypt.hash(this.password, 12); // `this` refers to the user document about to be saved
});

module.exports = { UsersSchema };
