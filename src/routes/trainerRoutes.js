const express = require('express');
const jwt = require('jsonwebtoken');
const userData = require("../model/UserModel");
const trainerData = require("../model/TrainerModel");

const trainerRouter = express.Router();

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

// get trainer profile
trainerRouter.get("/:trainer_email", verifyTrainerToken, function (req, res) {
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

// updating trainer profile by the trainer
trainerRouter.put("/", verifyTrainerToken, function (req, res) {
    console.log("update received", req.body)
    console.log("-------")
    var trainer = {
        email: req.body.trainer.email,
        address: req.body.trainer.address,
        skills: req.body.trainer.skills,
        company: req.body.trainer.company,
        designation: req.body.trainer.designation,
        courses: req.body.trainer.courses.map((x) => x.course_name),
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

module.exports = trainerRouter;