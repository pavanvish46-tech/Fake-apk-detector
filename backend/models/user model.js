const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String }, // agar login/password use karna ho
  apkCheckCount: { type: Number, default: 0 }, // kitni baar check kiya
});

module.exports = mongoose.model("User", userSchema);
