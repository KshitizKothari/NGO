const mongoose =    require("mongoose");
const { stringify } = require("nodemon/lib/utils");
const ngo_schema = new mongoose.Schema({
    CounsellorId: {
        type: String,
        required: true,
        unique: true
      },
       
  
    email: {
        type: String,
        required: true,
        unique: true
      },

    govtId:{
        type: String,
        required: true,
        unique: true
      },
    password: {
        type: String,
        required: true
      },
   
})


//creating collections


const Counsellor = new    mongoose.model("Counsellor", ngo_schema);
module.exports = Counsellor;