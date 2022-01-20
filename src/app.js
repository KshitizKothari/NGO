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
const bcrypt = require('bcryptjs');
const multer = require('multer');
const flash = require ('connect-flash');
const alert = require('alert')
const { render, redirect } = require("express/lib/response");

const port = process.env.PORT || 3000;

const static_path = path.join(__dirname, "../public")

const storage=multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads');
    },
    filename: (req,file,cb) => {
        cb(null, Date.now()+path.extname(file.originalname))
    }
})

const upload =multer({storage: storage});

const store = new MongoDBSession({
    uri:  `mongodb://${credientials.DB_USERNAME}:${credientials.DB_PASSWORD}@cluster0-shard-00-00.pfbcq.mongodb.net:27017,cluster0-shard-00-01.pfbcq.mongodb.net:27017,cluster0-shard-00-02.pfbcq.mongodb.net:27017/${credientials.DATABASE}?ssl=true&replicaSet=atlas-waesu8-shard-0&authSource=admin&retryWrites=true&w=majority`,
    collection: "sessions",
})

app.use(flash());
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

const isNotAuth = (req, res, next) => {
    if(req.session.isAuth && req.session.role==="user"){
        res.redirect("/userDashboard");
    }
    else if(req.session.isAuth && req.session.role==="counsellor"){
        res.redirect("/counsellorDashboard");
    }
    else{
        
        next();
    }
}

app.get("/", isNotAuth, (req, res) =>{
    res.render("index",{"title":"Confab"});
});

app.get("/aboutUs", isNotAuth,(req, res) =>{
    res.render("aboutUs",{"title":"About Us"});
});


// ------------------Get User Registration------------------ 
app.get("/userRegistration", isNotAuth, function(req,res){
    res.render('userRegistration',{"title":"Register", 'message':'', 'error': ''});
})

// ------------------User Registration---------------
app.post("/userRegistration", isNotAuth, async (req,res)=> {
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
            // console.log(err);            
            return res.render("userRegistration",{"message":"", 'error':'Cannot create User with these credentials'});
        }
        else{
            console.log(newuser)
            res.render('index', {'message':'', error:""});
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
app.get("/counsellorRegistration", isNotAuth, function(req,res){
    res.render("counsellorRegistration",{"title":"Register",'message':'', error:""});
})

// --------------Post Counsellor Registration--------------------------------
app.post("/counsellorRegistration", upload.single('profileImage'), isNotAuth, async (req,res)=> {
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
    if(req.file)
        counsellor.image = req.file.filename;

    
    counsellor.save(function(err,newcounsellor){
        if(err){
            console.log(err);
            return res.render('counsellorRegistration', {"error":"Cannot create Counsellor with these credentials", 'message': ''});
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
app.get("/userLogin", isNotAuth, function(req,res){
    res.render("userLogin",{"title":"Login", 'message':'', error:""});
})

//--------------Post User Login-----------------------------------
app.post("/userLogin", isNotAuth, async (req,res) =>{
    const { email, password } =req.body;
    const user = await User.findOne({email:email});

    if(!user){
        // req.flash('message','Wrong email address');
        return res.render('userLogin', {"error":"Wrong email address", 'message': ''})
    }
    
    const isMatch = await bcrypt.compare(password,user.password);
     
    if(!isMatch){
        return res.render('userLogin', {"error":"Invalid Passoword", 'message': ''})
    }
    else{
        req.session.isAuth=true;
        req.session.role="user";
        req.session.user_id = user._id;
        res.redirect("/userDashboard");
    }
});

// -----------------Get Counsellor Login---------------------------------------
app.get("/counsellorLogin", isNotAuth, function(req,res){
    res.render("counsellorLogin",{"title":"Login",  'message':'', 'error': ''});
})
//  ---------------------Post Counsellor Login----------------------------------------
app.post("/counsellorLogin", async (req,res) =>{
    const { email, password } =req.body;
    const counsellor = await Counsellor.findOne({email:email});

    if(!counsellor){
        // return res.redirect('/counsellorLogin');
        return res.render('counsellorLogin', {"error":"Email doesn't exists", 'message': ''})
    }
    
    const isMatch = await bcrypt.compare(password,counsellor.password);
     
    if(!isMatch){
        return res.render('counsellorLogin', {"error":"Wrong password", 'message': ''})
    }
    else{
        req.session.isAuth=true;
        req.session.role="counsellor";
        req.session.counsellor_id = counsellor._id;
        res.redirect("/counsellorDashboard");
    }
});

//-------------------------------------Get User Dashboard-----------------------------------
app.get("/userDashboard", isUserAuth, async (req,res) =>{
    var counsellor_projection = { _id:1, name:1, qualification:1, description:1, age:1, image:1}
    var appointment_projection = { date:1, time:1, counsellor:1 };
    var user_id = JSON.parse(JSON.stringify(req.session.user_id))
    console.log(user_id);

    const counsellors = await Counsellor.find({}, counsellor_projection);
    var appointments = await Appointment.find({ "user.id": user_id }, appointment_projection);
    console.log(appointments);
    if(appointments===null){
        appointments=[]
    }
    res.render("userDashboard", {"title":"Dashboard","counsellors" : counsellors, "appointments": appointments, error :'', message:''})

    
})


app.get("/setAppointment", isUserAuth, (req,res) => {
    var counsellor_id=req.query.counsellor_id;
    // console.log("counsellor id------------------------------------------------")
    // console.log(counsellor_id);
    res.render('setAppointment', {"title": "Set Appoitment", "counsellor_id": counsellor_id, "date": '',"slotsBooked":[]})
})

//  ---------------------------Check Availability of counsellor on particular date---------------------------------
app.post("/checkDateAvailability", isUserAuth, async (req,res) => {
    // console.log(req.body.date);
    var counsellor_id=req.body.counsellor_id;
    var appointment_projection = {time:1};
    var counsellor_projection = { _id:1, name:1, qualification:1, description:1};
    // checking the booked slots
    // console.log("date----------------------------");
    // console.log(req.body.date);
    // console.log(counsellor_id);
    var slotsBooked = await Appointment.find({date:req.body.date, "counsellor.id": counsellor_id}, appointment_projection);
    const counsellor= await Counsellor.findOne({_id:counsellor_id}, counsellor_projection);
    console.log(slotsBooked);
    if(slotsBooked===null){
        // console.log("NUll slots booked");
        slotsBooked=[]
    }
    
    res.render('setAppointment', {"title": "Set Appoitment", "counsellor_id": counsellor_id, "slotsBooked":slotsBooked, "counsellor": counsellor, "date":req.body.date})
})

// ------------------------------set user appointment----------------------------------
app.post("/setAppointment", isUserAuth, async (req,res) =>{
    var user_query={ date:req.body.date, time:req.body.time, user_id:req.session.user_id}
    var counsellor_query={ counsellor_id: req.body.counsellor_id, date:req.body.date, time:req.body.time}
    
    
    const user_schedule_clear = await Appointment.findOne(user_query);
    const counsellor_schedule_clear = await Appointment.findOne(counsellor_query);
    if(user_schedule_clear!=null || counsellor_schedule_clear!=null)
    {
        return res.render("error",{error:"Oops.. seems like you already have an appoinment at this time try another time"});
    }

    // console.log("displaying counsellor id");
    // console.log(counsellor_id);
    var user = await User.findOne({_id:req.session.user_id}, { _id:1, email:1, name:1});
    var counsellor = await Counsellor.findOne({_id:req.body.counsellor_id}, { _id:1, email:1, name:1});
    // console.log("showing counsellor details");
    // console.log(counsellor_details);
    var appointment = Appointment( {
        time: req.body.time,
        date: req.body.date,
        counsellor: {
            id: counsellor.id,
            email: counsellor.email,
            name: counsellor.name
        },
        user:{
            id: user.id,
            email: user.email,
            name: user.name
        },
    })

    appointment.save(function(err,newappointment){
        if(err){
            console.log(err);
            
            res.send("Cannot create appointment with these credentials");
        }
        else{
            console.log(newappointment);
            alert("Appointment booked successfully");
            res.redirect("/userDashboard");
            // res.redirect('userDashboard.html');

            // ----------------------------------------------sending email for appointment--------------------------------
            
            var user_text = `Your appointment is successfully booked with ${counsellor.name} on ${req.body.date} at ${req.body.time}:00`
            var counsellor_text = `You have an appointment booked with ${user.name} on ${req.body.date} at ${req.body.time}:00`
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
                to: counsellor.email,
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

})

//------------------------------Get Counsellor Dashboard-----------------------------------------------------

app.get("/counsellorDashboard", isCounsellorAuth, async (req,res) =>{
    var counsellor_projection = { name:1, qualification:1, description:1, age:1, image:1, email:1,phone:1, address:1}
    var counsellor_id = JSON.parse(JSON.stringify(req.session.counsellor_id))
    var query = {_id:counsellor_id}
    var appointment_projection = { date:1,time:1, user:1 };


    const counsellor = await Counsellor.findOne(query, counsellor_projection);
    var appointments = await Appointment.find({ "counsellor.id": counsellor_id }, appointment_projection);
    // console.log(counsellors);
    if(appointments===null){
        appointments=[]
    }
    res.render("counsellorDashboard", {"title":"Dashboard","counsellor" : counsellor, "appointments": appointments})

})

app.get("/userProfile", isUserAuth, async(req,res) =>{
    var user_id = req.session.user_id;
    const user = await User.findOne({_id: user_id},{email:1, name:1, age:1, address:1, phone:1, govtId:1});
    console.log(user);
    res.render("userProfile",{"title":"Profile", "user": user});
})

app.post("/deleteAppointment", isCounsellorAuth, async (req, res) => {
    var id= req.body.appointment_id
    var appointment = await Appointment.findOne({_id:id});
    // var user = await User.findOne({email:appointment.user.email},{email:1, name:1});
    // var counsellor_id = req.session.counsellor_id;
    // var counsellor = await Counsellor.findOne({_id:counsellor_id},{email:1,name:1});
    var user = appointment.user;
    var counsellor = appointment.counsellor;
    var date = req.body.date;
    var time = req.body.time;
    // console.log(user);
    // console.log(counsellor);
    // console.log(counsellor.email);
    // console.log(req.body.date);
    // console.log(req.body.time);
    // Appointment.remove({})

    Appointment.deleteOne({_id:appointment.id}, (err, res) => {
        if(err){
            res.status(500).send("Couldn't delete appointment");
            console.log(err);
        }
        else{
            // ------------------------------------Sending email---------------------------------------------------
            var user_text = `Your appointment with ${counsellor.name} on ${date} at ${time}:00 has been cancelled by the counsellor`
            var counsellor_text = `You have cancelled appointment with ${user.name} on ${date} at ${time}:00`
            var mailOptions = {
                from: EMAIL,
                to: user.email,
                subject: 'Appointment cancelled',
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
                to: counsellor.email,
                subject: 'Appointment cancelled',
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
    })
    alert("Appointment deleted successfully");
    res.redirect("/counsellorDashboard");
})

app.post('/updateUserDetails', isUserAuth, async (req,res) =>{
    var name= req.body.name;
    var age= req.body.age;
    var phone = req.body.phone;
    var address =req.body.address;
    console.log(name);
    console.log(age);
    console.log(phone);
    var user = await User.findOne({_id:req.session.user_id});
    

    user.name=name;
    user.age=age;
    user.phone=phone;
    user.address=address;
    // console.log(user);
    user.save();
    res.redirect('/userProfile');

})

app.post('/updateCounsellorDetails', isCounsellorAuth, async (req,res) =>{
    var name= req.body.name;
    var age= req.body.age;
    var phone = req.body.phone;
    var address =req.body.address;
    var qualificaiton =req.body.qualificaiton;
    var description =req.body.description;
    console.log(name);
    console.log(age);
    console.log(phone);
    var counsellor = await Counsellor.findOne({_id:req.session.counsellor_id});
    

    counsellor.name=name;
    counsellor.age=age;
    counsellor.phone=phone;
    counsellor.address=address;
    counsellor.qualificaiton=qualificaiton;
    counsellor.description=description;

    // console.log(user);
    counsellor.save();
    res.redirect('/counsellorDashboard');

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