const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config({path:__dirname+'/.env'});
const jwt = require("jsonwebtoken");

const PORT = process.env.PORT || 3000;
const app = express();
app.use(cors());
app.use(express.json());

const userData = require('./src/model/UserModel')


app.get("/", (req, res) => {
    res.send("<h2>ICT Trainer Management System</h2><p>FSD Project group 4</p><p>Backend</p>");
    // console.log(req);
})


app.post('/login', function(req,res) {
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



app.listen(PORT, () => {
    console.log(`app ready on port: ${PORT}`);
})