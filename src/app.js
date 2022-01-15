const express = require("express");
const path = require("path");
var bodyParser = require('body-parser')
const app = express();
require("./db/conn");
var credientials =require("./db/credentials");
const User = require("./models/user");
const Counsellor = require('./models/counsellor');
const Appointment = require('./models/appointment');
const { response } = require("express");
const { ReadableStreamBYOBRequest } = require("stream/web");
const { request } = require("http");
const session = require('express-session');
const MongoDBSession = require('connect-mongodb-session')(session);
const bcrypt=require('bcryptjs');

const port = process.env.PORT || 3000;

const static_path = path.join(__dirname, "../public/html")

const store = new MongoDBSession({
    uri:  `mongodb://${credientials.DB_USERNAME}:${credientials.DB_PASSWORD}@cluster0-shard-00-00.pfbcq.mongodb.net:27017,cluster0-shard-00-01.pfbcq.mongodb.net:27017,cluster0-shard-00-02.pfbcq.mongodb.net:27017/${credientials.DATABASE}?ssl=true&replicaSet=atlas-waesu8-shard-0&authSource=admin&retryWrites=true&w=majority`,
    collection: "sessions",
})

app.use(express.static(static_path));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}))
app.use(session({
    secret:"secret key to sign the cookie",
    resave:false,
    saveUninitialized: false,
    store:store
}))



app.get("/", (req, res) =>{
    res.render("index");
});




// ------------------Get User Registration------------------ 
app.get("/userRegistration", function(req,res){
    res.redirect('userRegistration.html');
})

// ------------------User Registration---------------
app.post("/userRegistration", async (req,res)=> {
    var user= new User();

    user.email   =   req.body.email;
    user.name   =   req.body.name;
    user.age =   req.body.age;
    user.phone   =   req.body.phone;
    user.address =   req.body.address;
    user.govtId = req.body.govtId;
    user.password    =   await bcrypt.hash(req.body.password,12);

    
    user.save(function(err,newuser){
        if(err){
            console.log(err);
            
            res.send("Cannot create User with these credentials");
        }
        else{
            console.log(newuser)
            res.redirect('index.html');
        }
    });
         
}
)

// ---------------------Get Counsellor Registration-------------------------------------
app.get("/counsellorRegistration", function(req,res){
    res.redirect("counsellorRegistration.html");
})

// --------------Post Counsellor Registration--------------------------------
app.post("/counsellorRegistration", async (req,res)=> {
    var counsellor= new Counsellor();

    // console.log(req.body.qualificaiton);
    counsellor.email   =   req.body.email;
    counsellor.name   =   req.body.name;
    counsellor.age =   req.body.age;
    counsellor.phone   =   req.body.phone;
    counsellor.address =   req.body.address;
    counsellor.govtId = req.body.govtId;
    counsellor.qualification = req.body.qualification;
    counsellor.description = req.body.description;
    counsellor.password    =   await bcrypt.hash(req.body.password,12);

    
    counsellor.save(function(err,newcounsellor){
        if(err){
            console.log(err);
            
            res.send("Cannot create Counsellor with these credentials");
        }
        else{
            console.log(newcounsellor)
            res.redirect('index.html');
        }
    });
         
}
)

// --------------------------User Login Get----------------------
app.get("/userLogin", function(req,res){
    res.redirect("userLogin.html");
})

//--------------User Loign Post-----------------------------------
app.post("/userLogin", async (req,res) =>{
    const { email, password } =req.body;
    const user = await User.findOne({email:email});

    if(!user){
        return res.redirect('/userLogin');
    }
    
    const isMatch = await bcrypt.compare(password,user.password);
     
    if(!isMatch){
        return res.send("Wrong password");
    }
    else{
        res.send("Logged In");
    }
});

//  ---------------------Counsellor Login----------------------------------------
app.get("/counsellorLogin", async (req,res) =>{
    const { email, password } =req.body;
    const counsellor = await Counsellor.findOne({email:email});

    if(!counsellor){
        return res.redirect('/counsellorLogin');
    }
    
    const isMatch = await bcrypt.compare(password,counsellor.password);
     
    if(!isMatch){
        return res.send("Wrong password");
    }
    else{
        res.send("Logged In");
    }
});

//----------user dashboard---------------
app.get("/userDashboard", (req,res) =>{
    var projection = { name:1, qualification:1, description:1, age:1}
    Counsellor.find({}, projection, function(err,counsellors){
        if(err){
            console.log(err);
            response.status(500).send({error:"Counsellor not found"});
        }
        else{
            res.send(counsellors);
        }
    })
})


// ------------get user appointment details-----------------------
app.get("/userAppointment", (req,res) =>{
    var projection = { date:1,time:1 };
    console.log("In appointment");
    console.log(req.body.id);
    Appointment.find({_id: req.body.user_id}, projection, function(err,appointments){
        if(err){
            console.log(err);
            response.status(500).send({error:"Counsellor not found"});
        }
        else{
            res.send(appointments);
        }
    })
})


// ------------------------------set user appointment----------------------------------
app.post("/setAppointment", async (req,res) =>{
    var user_query={ date:req.body.date, time:req.body.time, user_id:req.body.user_id}
    var counsellor_query={ counsellor_id: req.body.counsellor_id, date:req.body.date, time:req.body.time}
    

    
    const user_schedule_clear = await Appointment.find(user_query);
    const counsellor_schedule_clear = await Appointment.find(counsellor_query);
    if(user_schedule_clear===null && counsellor_schedule_clear===null)
    {
        res.send("Can't book appointment at this time");
    }
    var appointment = Appointment( {
        time: req.body.time,
        date: req.body.date,
        counsellorId: req.body.user_id,
        userId: req.body.user_id,
    })

    appointment.save(function(err,newappointment){
        if(err){
            console.log(err);
            
            res.send("Cannot create Counsellor with these credentials");
        }
        else{
            console.log(newappointment)
            res.send("Going to user dashboard");
            // res.redirect('userDashboard.html');
        }
    });


    // Appointment.find(counsellor_query, function(err,appointments){
    //     if(err){
    //         console.log(err);
    //         const dataInserted=await Appointment.insertOne(data);
    //         if(!dataInserted){
    //             // console.log()
    //             res.send("Could book the appointment");
    //         }
    //         else{
    //             res.send("Appointment booked");
    //         }
            
    //     }
    //     else{
    //         // res.send(appointments);
    //         res.status(400).send({error:"Cannot book appointment at this date and time"});
    //     }
    // })
})

app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})