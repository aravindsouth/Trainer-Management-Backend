const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config({path:__dirname+'/.env'});
const jwt = require("jsonwebtoken");

const PORT = process.env.PORT || 3000;
const app = express();
app.use(cors());
app.use(express.json());

const userData = require("./src/model/UserModel");
const trainerData = require("./src/model/TrainerModel");

// get methods

app.get("/", (req, res) => {
    res.send("<h2>ICT Trainer Management System</h2><p>FSD Project group 4</p><p>Backend</p>");
    // console.log(req);
})

app.get("/trainers", function(req, res) {
    trainerData.find()
    .then((trainers) => {
        res.send(trainers).status(200);
    })
})

// post methods

app.post("/login", function(req,res) {
    var checkuser = {
        email:req.body.email,
        pwd:req.body.password
    };
    console.log('log in process start');
    console.log(checkuser);
    try {
        userData.findOne({"username": checkuser.email}, (error, user) => {
            console.log(user)
            if(error) {
                console.log(error);
            }
            else {
                if(!user) {
                    res.status(401).send("Invalid Email");
                    // res.json({status:false});
                }
                else if (checkuser.pwd != user.password) {
                    res.status(401).send("Invalid Password");
                    // res.json({status:false});
                }
                else {
                    let payload = {subject: user._id};;
                    let token = jwt.sign(payload, "secretkey1");;
                    console.log(token);
                    if (user.role == "admin"){
                    res.status(200).send({status:true,name:user.username,role: "admin",token});
                    } else {
                        res.status(200).send({status:true,name:user.username,token});
                    }
                }
            }
        })
    }
    catch(e) {
        console.log(error);
        res.send(e);
    }
})

app.post("/signup", function(req,res) {
    var newUser = {
        name: req.body.fname,
        dob: req.body.dob,
        email: req.body.email,
        mobile: req.body.mobile,
        highestqual: req.hqual,
        password: req.body.password
    };
    console.log('signup process starts');
    console.log(newUser);
    userData.findOne({"username": newUser.email}, (error, user) => {
        console.log("error="+error);
        console.log("user="+user);
        if(error) {
            console.log(error)
        }
        else if(user) {
            console.log("user exists");
            res.json({status:false, reason: "user exists"});
        }
        else {
            var userAdd = new userData({
                username: newUser.email,
                password: newUser.password,
                role: "trainer"
            });
            var trainerAdd = new trainerData({
                email: newUser.email,
                dob: newUser.dob,
                name: newUser.name,
                phone: newUser.mobile,
                highestqual: newUser.highestqual,
                approved: false
            })
            userAdd.save((error, newuser) => {
                console.log('Saved new user='+newuser)
                console.log("error="+error)
                if(error) {
                    console.log(error)
                    res.json({status:true})
                }
                else {
                    trainerAdd.save((error, trainer) => {
                        if(error) {
                            console.log(error)
                        }else {
                            console.log("trainer added",trainer)
                        }
                    })
                    res.json({status:true}).status(200)
                }
            })
        }
    })
})

app.post("/enroll", function(req, res) {
    var trainer = {
        email: req.body.email,
        address: req.body.address,
        skills: req.body.skills,
        company: req.body.company,
        designation: req.body.designation,
        courses: req.body.courses,
        photo: req.body.photo,
        trainer_id: req.body.t_id
    };
    trainerData.updateOne({email: trainer.email},
                            {
                                address: trainer.address,
                                skills: trainer.skills,
                                company: trainer.company,
                                designation: trainer.designation,
                                courses: trainer.courses,
                                photo: req.body.photo,
                                trainer_id: req.body.t_id,       
                            }, (error, trainer) => {
                                if(error) {
                                    console.log(error);
                                }else {
                                    console.log(trainer);
                                    res.json({status: true, reply: "trainer update"}).status(200);
                                }
                            })
})

app.listen(PORT, () => {
    console.log(`app ready on port: ${PORT}`);
})