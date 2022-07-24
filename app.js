const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config({path:__dirname+'/.env'});
const jwt = require("jsonwebtoken");

const PORT = process.env.PORT || 3000;
const app = express();
app.use(cors());
app.use(express.json());


app.get("/", (req, res) => {
    res.send("<h2>ICT Trainer Management System</h2><p>FSD Project group 4</p><p>Backend</p>");
    console.log(req);
})

app.listen(PORT, () => {
    console.log(`app ready on port: ${PORT}`);
})