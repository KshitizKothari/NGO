const mongoose =    require("mongoose");
const { stringify } = require("nodemon/lib/utils");
const ngo_schema = new mongoose.Schema({
    firstname: {
        type: String,
        required: true
      },
       
    lastname: {
        type: String,
        required: true
      },
    email: {
        type: String,
        required: true,
        unique: true
      },
    phone: {
        type: Number,
        required: true,
        unique: true

      },
    age:{
        type: Number,
        required: true
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


const User = new    mongoose.model("User", ngo_schema);
module.exports = User;