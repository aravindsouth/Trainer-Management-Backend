const express = require('express');
const jwt = require('jsonwebtoken');
const userData = require("../model/UserModel");
const loginRouter = express.Router();
const bcrypt = require('bcrypt')

// loginRouter.post("/", function (req, res) {
//     var checkUser = {
//         email: req.body.email,
//         pwd: req.body.password
//     };
//     console.log('log in process start');
//     console.log(checkUser);
//     try {
//         userData.findOne({ "username": checkUser.email }, (error, user) => {
//             console.log(user)
//             if (error) {
//                 console.log(error);
//             }
//             else {
//                 if (!user) {
//                     res.json({status:false}).status(401);
//                     // res.json({status:false});
//                 }
//                 else if (checkUser.pwd != user.password) {
//                     res.json({status:false}).status(401);
//                     // res.json({status:false});
//                 }
//                 else {
//                     let payload = { subject: checkUser.email + checkUser.password };
//                     if (user.role == "admin") {
//                         let token = jwt.sign(payload, "adminKey");
//                         console.log("admin token: ", token);
//                         res.status(200).send({ status: true, name: user.username, role: "admin", token });
//                     } else {
//                         let token = jwt.sign(payload, "trainerKey");
//                         console.log("trainer token: ", token);
//                         res.status(200).send(
//                             {
//                                 status: true,
//                                 trainer_email: user.username,
//                                 role: "trainer",
//                                 token
//                             });
//                     }
//                 }
//             }
//         })
//     }
//     catch (e) {
//         console.log(error);
//         res.send(e);
//     }
// })

// using bcrypt
loginRouter.post("/", function(req, res) {
    var checkUser = {
        email: req.body.email,
        pwd: req.body.password
    };
    try {
        userData.findOne({"username": checkUser.email}, (error, user) => {
            console.log(user)
            if (error) {
                console.log(error);
            }else {
                bcrypt.compare(checkUser.pwd, user.password, (err, response)=> {
                    if (err) return err;
                    if(!response) {
                        res.json({status:false}).status(401);
                    }else {
                        let payload = { subject: checkUser.email + checkUser.password };
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
                })
            }
        })
    }
    catch(e) {
        console.log(error)
        res.send(e)
    }
})


module.exports = loginRouter;
