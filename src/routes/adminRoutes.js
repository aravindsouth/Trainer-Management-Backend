const express = require('express');
const jwt = require('jsonwebtoken');
const trainerData = require("../model/TrainerModel");
const nodemailer = require("nodemailer");

const adminRouter = express.Router();

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

// trainer id generation
function generateId(trainer) {
    console.log('function reached')
    let part1 = trainer.phone.slice(6)
    let part2 = trainer.dob.slice(0,2)
    console.log("trainer id generated: "+ part1 + part2)
    return `T${part1}${part2}`

}
// email notification API
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

// get trainers list
adminRouter.get("/", verifyAdminToken, function (req, res) {
    trainerData.find()
        .then((trainers) => {
            res.send(trainers).status(200);
        })
})

// approve trainer
adminRouter.put("/", verifyAdminToken, function (req, res) {
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

// set employmnet status
adminRouter.put("/set-employment-type",verifyAdminToken, function (req, res) {
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

// adding new courses for trainer
adminRouter.put("/", verifyAdminToken, function(req, res) {
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

module.exports = adminRouter;