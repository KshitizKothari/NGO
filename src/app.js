const express = require("express");
const path = require("path");
var bodyParser = require('body-parser')
const app = express();
require("./db/conn");
var nodemailer = require('nodemailer');
var credientials =require("./db/credentials");
const User = require("./models/user");
const Counsellor = require('./models/counsellor');
const Appointment = require('./models/appointment');
const { response } = require("express");
const { ReadableStreamBYOBRequest } = require("stream/web");
const { request } = require("http");
const { EMAIL, PASSWORD } =require('./confidentials/ngoMailCredentials')
const session = require('express-session');
const MongoDBSession = require('connect-mongodb-session')(session);
const bcrypt=require('bcryptjs');

const port = process.env.PORT || 3000;

const static_path = path.join(__dirname, "../public")

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

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true}));

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: EMAIL,
      pass: PASSWORD
    }
  });

const isUserAuth = (req, res, next) => {
    if(req.session.isAuth && req.session.role==="user"){
        next();
    }
    else{
        res.redirect("/");
    }
}

const isCounsellorAuth = (req, res, next) => {
    if(req.session.isAuth && req.session.role==="counsellor"){
        next();
    }
    else{
        res.render("index");
    }
}


app.get("/", (req, res) =>{
    res.render("index",{"title":"Confab"});
});

app.get("/aboutUs", (req, res) =>{
    res.render("aboutUs",{"title":"About Us"});
});


// ------------------Get User Registration------------------ 
app.get("/userRegistration", function(req,res){
    res.render('userRegistration',{"title":"Register"});
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
            res.render('index');
            //   ------------------sending email------------------
              var mailOptions = {
                from: EMAIL,
                to: newuser.email,
                subject: 'Successful registration',
                text: 'Congratulation you have been registered successfully'
              };
              
              transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                  console.log(error);
                } else {
                  console.log('Email sent: ' + info.response);
                }
              });
        }
    });
         
}
)

// ---------------------Get Counsellor Registration-------------------------------------
app.get("/counsellorRegistration", function(req,res){
    res.render("counsellorRegistration",{"title":"Register"});
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
            
            return res.send("Cannot create Counsellor with these credentials");
        }
        else{
            console.log(newcounsellor)
            res.render('index');
            //   ------------------sending email------------------  
            var mailOptions = {
            from: EMAIL,
            to: newcounsellor.email,
            subject: 'Successful registration',
            text: 'Congratulation you have been successfully registered as counsellor'
            };
            
            transporter.sendMail(mailOptions, function(error, info){
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
            });
        }
       
    });
         
}
)

// --------------------------Get User Login----------------------
app.get("/userLogin", function(req,res){
    res.render("userLogin",{"title":"Login"});
})

//--------------Post User Login-----------------------------------
app.post("/userLogin", async (req,res) =>{
    const { email, password } =req.body;
    const user = await User.findOne({email:email});

    if(!user){
        return res.render('userLogin');
    }
    
    const isMatch = await bcrypt.compare(password,user.password);
     
    if(!isMatch){
        return res.send("Wrong password");
    }
    else{
        req.session.isAuth=true;
        req.session.role="user";
        req.session.user_id = user._id;
        res.redirect("/userDashboard");
    }
});

// -----------------Get Counsellor Login---------------------------------------
app.get("/counsellorLogin", function(req,res){
    res.render("counsellorLogin",{"title":"Login"});
})
//  ---------------------Post Counsellor Login----------------------------------------
app.post("/counsellorLogin", async (req,res) =>{
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
        req.session.isAuth=true;
        req.session.role="counsellor";
        req.session.counsellor_id = counsellor._id;
        res.redirect("/counsellorDashboard");
    }
});

//----------Get User Dashboard---------------
app.get("/userDashboard", isUserAuth, async (req,res) =>{
    var counsellor_projection = { name:1, qualification:1, description:1, age:1}
    var appointment_projection = { date:1, time:1, counsellor:1 };


    const counsellors = await Counsellor.find({}, counsellor_projection);
    const appointments = await Appointment.find({_id:req.session.user_id}, appointment_projection);
    // console.log(counsellors);
    res.render("userDashboard", {"title":"Dashboard","counsellors" : counsellors, "appointments": appointments})

    
})


// ------------Get User Appointment Details-----------------------
// app.get("/userAppointment",isUserAuth, (req,res) =>{
//     var projection = { date:1,time:1 };
//     console.log("In appointment");
//     console.log(req.body.id);
//     Appointment.find({_id: req.body.user_id}, projection, function(err,appointments){
//         if(err){
//             console.log(err);
//             response.status(500).send({error:"Counsellor not found"});
//         }
//         else{
//             res.send(appointments);
            
//         }
//     })
// })


app.get("/setAppointment", isUserAuth, (req,res) => {
    res.render('setAppointment', {"title": "Set Appoitment"})
})

// ------------------------------set user appointment----------------------------------
app.post("/setAppointment", isUserAuth, async (req,res) =>{
    var user_query={ date:req.body.date, time:req.body.time, user_id:req.body.user_id}
    var counsellor_query={ counsellor_id: req.body.counsellor_id, date:req.body.date, time:req.body.time}
    

    
    const user_schedule_clear = await Appointment.find(user_query);
    const counsellor_schedule_clear = await Appointment.find(counsellor_query);
    if(user_schedule_clear!=null || counsellor_schedule_clear!=null)
    {
        return res.send("Can't book appointment at this time");
    }
    var user = await User.findOne({_id:req.body.user_id}, { _id:1, email:1, name:1});
    var counsellor = await Counsellor.findOne({_id:req.body.counsellor_id}, { _id:1, email:1, name:1});
    var appointment = Appointment( {
        time: req.body.time,
        date: req.body.date,
        counsellor: {
            id: counsellor._id,
            email: counsellor.email,
            name: counsellor.name
        },
        user: {
            id: user._id,
            email: user.email,
            name: user.name
        },
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

            // ----------------------------------------------sending email for appointment--------------------------------
            
            var user_text = `Your appointment is successfully booked with ${counsellor.name} on ${req.body.date} ${req.body.time}`
            var counsellor_text = `You have an appointment booked with ${user.name} on ${req.body.date} ${req.body.time}`
            var mailOptions = {
                from: EMAIL,
                to: user.email,
                subject: 'Appointment booked',
                text: user_text
            };
                
            transporter.sendMail(mailOptions, function(error, info){
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
            });
            var mailOptions = {
                from: EMAIL,
                to: user.email,
                subject: 'New Appointment booked',
                text: counsellor_text
            };
                    
            transporter.sendMail(mailOptions, function(error, info){
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
            });
            
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

//------------------------------Get Counsellor Dashboard-----------------------------------------------------

app.get("/counsellorDashboard", isCounsellorAuth, async (req,res) =>{
    var counsellor_projection = { name:1, qualification:1, description:1, age:1}
    var query = {_id:req.session.counsellor_id}
    var appointment_projection = { date:1,time:1 };


    const counsellor = await Counsellor.findOne(query, counsellor_projection);
    const appointments = await Appointment.find({_id:req.session.counsellor_id}, appointment_projection);
    // console.log(counsellors);
    res.render("counsellorDashboard", {"title":"Dashboard","counsellor" : counsellor, "appointments": appointments})

})

app.get("/logout", (req,res) => {
    req.session.destroy((err) => {
        if(err) throw err;
        res.redirect("/");
    });
})

app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})