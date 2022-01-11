const mongoose =    require("mongoose");
const { stringify } = require("nodemon/lib/utils");
const ngo_schema = new mongoose.Schema({
   appointmentId: {
        type: String,
        required: true,
        unique: true
      },
       
   time: {
       type: String,
       require: true,
       unique: true
   }
   ,
    userId: {
        type: String,
        require: true,
        unique: true
    },

   counsellorId: {
        type: String,
        required: true,
        unique: true

      },
    })


//creating collections


const Appointment   = new    mongoose.model("Appointment", ngo_schema);
module.exports = Appointment;