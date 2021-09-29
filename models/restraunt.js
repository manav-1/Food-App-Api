const mongoose = require("mongoose");

const restrauntSchema = new mongoose.Schema({
  name: { type: String, default: null },
  email: { type: String, unique: true },
  password: { type: String },
  type: { type: String },
});

module.exports = mongoose.model("restraunt", restrauntSchema);
