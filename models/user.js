const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  userId: String,
  name: {
    firstName: String,
    lastName: String,
  },
  email: String,
  password: String,
});

const User = mongoose.model("User", userSchema);
module.exports = User;
