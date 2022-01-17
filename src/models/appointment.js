const mongoose = require("mongoose");
const { stringify } = require("nodemon/lib/utils");
const appointment = new mongoose.Schema({
  date: {
    type: String,
    required: true,
  },
  time: {
    type: String,
    require: true,
  },
  user: new mongoose.Schema({
    id:{type: String, require: true},
    email: { type: String, require: true },
    name: { type: String, require: true },
  }),

  counsellor: new mongoose.Schema({
    id:{type: String, require: true},
    email: { type: String, require: true },
    name: { type: String, require: true },
  }),
});

//creating collections

const Appointment = new mongoose.model("Appointment", appointment);
module.exports = Appointment;
