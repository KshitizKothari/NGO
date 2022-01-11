const express = require("express");
const path = require("path");
const app = express();
require("./db/conn");
const User = require("./models/user");
const Counsellor = require('./models/counsellor');
const Appointment   =   require('./models/appointment');

const port = process.env.PORT || 3000;

const static_path = path.join(__dirname, "../public")

app.use(express.static(static_path));

app.get("/", (req, res) =>{
    res.send("Hello World!");
});

app.get("/test", (req,res) =>{
    User.find({}, function(err, users){
        if(err){
            console.log(err);
        }
        else{
            console.log(users);
            res.send(users);
        }
    })
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})