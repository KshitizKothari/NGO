const mongoose =    require("mongoose");
const { stringify } = require("nodemon/lib/utils");
const ngo_schema = new mongoose.Schema({
    date: {
        type:String,
        required: true
    },
   time: {
       type: String,
       require: true,
   },
    userId: {
        type: String,
        require: true,
    },

   counsellorId: {
        type: String,
        required: true,

      },
    })


//creating collections


const Appointment   = new    mongoose.model("Appointment", ngo_schema);
module.exports = Appointment;