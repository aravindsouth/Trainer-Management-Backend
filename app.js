const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config({ path: __dirname + '/.env' });
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const PORT = process.env.PORT || 3000;
const app = express();
app.use(cors());
app.use(express.json());

const userData = require("./src/model/UserModel");
const trainerData = require("./src/model/TrainerModel");
const { findOneAndReplace } = require("./src/model/TrainerModel");

// token verification

function verifyAdminToken(req, res, next) {
    if (!req.headers.authorization) {
        return res.status(401).send('Unauthorised request')
    }
    let token = req.headers.authorization.split(' ')[1]
    if (token == 'null') {
        return res.status(401).send('Unauthorised Request')
    }
    let payload = jwt.verify(token, 'adminKey')
    console.log(payload)
    if (!payload) {
        return res.status(401).send('Unauthorised Request')
    }
    req.userId = payload.subject;
    next();
}

function verifyTrainerToken(req, res, next) {
    if (!req.headers.authorization) {
        return res.status(401).send('Unauthorised request')
    }
    let token = req.headers.authorization.split(' ')[1]
    if (token == 'null') {
        return res.status(401).send('Unauthorised Request')
    }
    let payload = jwt.verify(token, 'trainerKey')
    console.log(payload)
    if (!payload) {
        return res.status(401).send('Unauthorised Request')
    }
    req.userId = payload.subject;
    next();
}

function sendEmail(data) {
    try {
        console.log(data)
        let transport = {
            host: "smtp-relay.sendinblue.com",
            port: 587,
            secure: false, // upgrade later with STARTTLS
            auth: {
                user: "aravindkerala1@gmail.com",
                pass: process.env.MAILER_PASS,
            }
        }
        let email_data = {
            from: "ictacademyadmin@ictaktrainer.com",
            to: data.email,
            subject: "Trainer Approved",
            text: `Your emplyment type is: ${data.employment_type} . Your ID is ${data.trainer_id}`,
            html: `<p> Hi ${data.name} </p> <p>Your employment type is: ${data.employment_type}.</p><p> Your ID is ${data.trainer_id}</p>`
        };
        let transporter = nodemailer.createTransport(transport)

        transporter.sendMail(email_data, function (err, info) {
            if (err) {
                console.log(err)
            } else {
                console.log(info)
            }
        })
    } catch (error) {
        return error
    }
}

function generateId(trainer) {
            console.log('function reached')
            let part1 = trainer.phone.slice(6)
            let part2 = trainer.dob.slice(0,2)
            console.log("trainer id generated: "+ part1 + part2)
            return `T${part1}${part2}`

}

// var approveTrainer;
// get methods


app.get("/", (req, res) => {
    res.send("<h2>ICT Trainer Management System</h2><p>FSD Project group 4</p><p>Backend</p>");
    // console.log(req);
})

app.get("/trainers", verifyAdminToken, function (req, res) {
    trainerData.find()
        .then((trainers) => {
            res.send(trainers).status(200);
        })
})

app.get("/trainer-profile/:trainer_email", verifyTrainerToken, function (req, res) {
    trainerData.findOne({ "email": req.params.trainer_email }, (error, trainer) => {
        if (!error) {
            console.log(req.params)
            console.log(trainer);
            res.send(trainer).status(200)
        } else {
            res.send("trainer data not found")
        }
    })
})

// post methods

app.post("/login", function (req, res) {
    var checkUser = {
        email: req.body.email,
        pwd: req.body.password
    };
    console.log('log in process start');
    console.log(checkUser);
    try {
        userData.findOne({ "username": checkUser.email }, (error, user) => {
            console.log(user)
            if (error) {
                console.log(error);
            }
            else {
                if (!user) {
                    res.json({status:false}).status(401);
                    // res.json({status:false});
                }
                else if (checkUser.pwd != user.password) {
                    res.json({status:false}).status(401);
                    // res.json({status:false});
                }
                else {
                    let payload = { subject: checkUser.email + checkUser.password };;
                    if (user.role == "admin") {
                        let token = jwt.sign(payload, "adminKey");
                        console.log("admin token: ", token);
                        res.status(200).send({ status: true, name: user.username, role: "admin", token });
                    } else {
                        let token = jwt.sign(payload, "trainerKey");
                        console.log("trainer token: ", token);
                        res.status(200).send(
                            {
                                status: true,
                                trainer_email: user.username,
                                role: "trainer",
                                token
                            });
                    }
                }
            }
        })
    }
    catch (e) {
        console.log(error);
        res.send(e);
    }
})

app.post("/signup", function (req, res) {
    var newUser = {
        name: req.body.fname,
        dob: req.body.dob,
        email: req.body.email,
        mobile: req.body.mobile,
        highestqual: req.body.hqual,
        password: req.body.password
    };
    console.log('signup process starts');
    console.log(newUser);
    userData.findOne({ "username": newUser.email }, (error, user) => {
        console.log("error=" + error);
        console.log("user=" + user);
        if (error) {
            console.log(error)
        }
        else if (user) {
            console.log("user exists");
            res.json({ status: false, reason: "user exists" });
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
                console.log('Saved new user=' + newuser)
                console.log("error=" + error)
                if (error) {
                    console.log(error)
                    res.json({ status: true })
                }
                else {
                    trainerAdd.save((error, trainer) => {
                        if (error) {
                            console.log(error)
                        } else {
                            console.log("trainer added", trainer)
                        }
                    })
                    res.json({ status: true, reason: "trainer added" }).status(200)
                }
            })
        }
    })
})

app.put("/enroll", verifyTrainerToken, function (req, res) {
    console.log("update received", req.body)
    console.log("-------")
    var trainer = {
        email: req.body.trainer.email,
        address: req.body.trainer.address,
        skills: req.body.trainer.skills,
        company: req.body.trainer.company,
        designation: req.body.trainer.designation,
        courses: req.body.trainer.courses,
        photo: req.body.pic_uri
    };

    console.log(trainer)
    trainerData.findOneAndUpdate({ email: trainer.email },
        {
            $set:{address: trainer.address,
            skills: trainer.skills,
            company: trainer.company,
            designation: trainer.designation,
            courses: trainer.courses,
            photo: trainer.photo
            }
        }, (error, trainer) => {
            if (error) {
                console.log(error);
            } else {
                console.log(trainer);
                res.json({ status: true, reply: "trainer update" }).status(200);
            }
        })
})

app.put("/approve-trainer", verifyAdminToken, function (req, res) {
    console.log("trainer received:" + req.body.email)
    trainerData.findOne({email: req.body.email}, function (error, trainer) {     
        if(!error){
            approveTrainer = trainer;
            console.log('approval started')
            console.log("trainer found:"+ trainer)
            trainerData.updateOne({ email: req.body.email },
                { $set: {approved: true, trainer_id: generateId(approveTrainer)} },
                (error, trainer) => {
                    console.log('updateOne reached')
                    if (error) {
                        console.log(error)
                        res.json({ status: false, reason: "trainer not updated" }).status(500)
                    } else {
                        console.log(trainer)
                        res.json({ status: true, reply: "trainer approved" }).status(200);
                    }
                })
        }else {console.log(error)}        
    });

})

// app.put("/set-employment-type", function(req, res) {
//     console.log("trainer received:"+req.body.email)
//     let trainer = {
//         email: req.body.email,
//         employment_type: req.body.employment_type,
//         trainer_id: req.body.trainer_id,
//         name: req.body.name
//     }
//     trainerData.updateOne({email: trainer.email},
//                             {employment_type: trainer.employment_type},
//                             (error, trainer) =>{
//                                 if(error) {
//                                     console.log(error)
//                                     res.json({status: false, reason: "employment status not updated"}).status(500)  
//                             }else {
//                                 console.log(trainer)
//                                 sendEmail(trainer)
//                                 res.json({status: true, reply: "employment updated email sent"}).status(200);
//                             }
// } )
// })

app.put("/set-employment-type", function (req, res) {
    console.log("trainer received for employment update: \n" + req.body.email)
    let trainer = {
        email: req.body.email,
        employment_type: req.body.employment_type,
        trainer_id: req.body.trainer_id,
        name: req.body.name
    }
    // sendEmail(trainer)
    // res.json({ status: true, reply: "employment updated email sent" }).status(200)
    trainerData.updateOne({email: trainer.email},
        {$set: {employment_type: trainer.employment_type}},
        (error, user) =>{
            if(error) {
                console.log(error)
                res.json({status: false, reason: "employment status not updated"}).status(500)  
        }else {
            console.log(trainer)
            sendEmail(trainer)
            res.json({status: true, reply: "employment updated email sent"}).status(200);
        }
} )
})

app.put("/add-course", verifyAdminToken, function(req, res) {
    console.log(req.body)
    course_data = {
        course_id: req.body.course_id,
        batch_id: req.body.batch_id,
        start_date: req.body.start_date,
        end_date: req.body.end_date,
        time: req.body.course_time,
        meeting_location: req.body.meetlink,
        schedule: req.body.schedule
    }
    trainerData.updateOne({email: req.body.email}, {$push: {ict_courses_data: course_data}}, (err, trainer) => {
        if(!err) {
            console.log("updated trainer: "+trainer)
            res.json({status: true, reason: "course added"}).status(200)
        }else {
            console.log(err)
            res.json({status: false, reason: "course not added"}).status(500)
        }
    })
})

app.listen(PORT, () => {
    console.log(`app ready on port: ${PORT}`);
})