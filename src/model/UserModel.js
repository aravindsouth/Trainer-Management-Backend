const mongoose = require("mongoose");

// mongoose.connect('mongodb://localhost:27017/projectDb');
mongoose.connect(process.env.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
const schema = mongoose.Schema;

const userSchema = new schema({
    username: String,
    password: String,
    role: String
});

const userData = mongoose.model("user", userSchema);

module.exports = userData;


