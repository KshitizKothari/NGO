const mongoose = require("mongoose");
const { stringify } = require("nodemon/lib/utils");
const counsellor = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
  },
  phone: {
    type: Number,
    required: true,
    unique: true,
  },
  age: {
    type: Number,
    required: true,
  },
  govtId: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  qualification: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
});

//creating collections

const Counsellor = new mongoose.model("Counsellor", counsellor);
module.exports = Counsellor;
