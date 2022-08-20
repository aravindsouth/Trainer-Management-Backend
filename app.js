const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config({ path: __dirname + '/.env' });
const bodyParser = require("body-parser");

const PORT = process.env.PORT || 3000;
const app = new express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));


const loginRouter = require('./src/routes/loginRoute');
const signupRouter = require('./src/routes/signupRoute');
const adminRouter = require('./src/routes/adminRoutes');
const trainerRouter = require('./src/routes/trainerRoutes');

app.use("/login", loginRouter);
app.use("", loginRouter);
app.use("/signup", signupRouter);
app.use("/trainers", adminRouter);
app.use("/trainer-update/", adminRouter);
app.use("/trainer-update/", adminRouter);
app.use("/trainer-update", adminRouter);
app.use("/trainer-profile", trainerRouter)
app.use("/enroll", trainerRouter)
app.use("/trainer-view/", adminRouter)


app.get("/", (req, res) => {
    res.send("<h2>ICT Trainer Management System</h2><p>FSD Project group 4</p><p>Backend</p>");
})


app.listen(PORT, () => {
    console.log(`app ready on port: ${PORT}`);
})