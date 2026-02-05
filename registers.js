const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  fullName: String,
  eliteCode: { type: String, unique: true },
  role: { type: String, enum: ["student", "admin"] },
  password: String
});

module.exports = mongoose.model("User", userSchema);
