const mongoose = require("mongoose");

// mongoose.connect('mongodb://localhost:27017/projectDb');
mongoose.connect(process.env.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const schema = mongoose.Schema;

const trainerSchema = new schema({
    name: String,
    email: String,
    dob: String,
    phone: String,
    address: String,
    highestqual: String,
    skills: [String],
    company: String,
    designation: String,
    courses: [String],
    photo: String,
    trainer_id: String,
    approved: Boolean,
    employment_type: String,
    ict_data: {
        start_date: Date,
        end_date: Date,
        time: String,
        course_id: String,
        batch_id: String,
        meeting_location: String,
        schedule: String
    }

});

const trainerData = mongoose.model('trainer', trainerSchema)
module.exports = trainerData;