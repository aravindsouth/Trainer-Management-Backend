const express = require('express');
const jwt = require('jsonwebtoken');
const userData = require("../model/UserModel");
const trainerData = require("../model/TrainerModel");

const signupRouter = express.Router();

signupRouter.post("/", function (req, res) {
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

module.exports = signupRouter;