//Import Mongoose framework >>
const mongoose = require("mongoose");

// << --- Creating the Schema --- >>

//Create a Schema for courses >>
var courses_schema = new mongoose.Schema({
  courseid: { type: String, required: true },
  grade: { type: Number, require: true, min: 0, max: 100 },
});

//Create a Schema for students >>
var student_schema = new mongoose.Schema(
  {
    id: { type: String, minlength: 9, maxlength: 9, required: true },
    name: { type: String, maxlength: 50, required: true },
    city: { type: String, maxlength: 50, required: true },
    toar: { type: String, enum: ["BA", "MA", "PHD"], required: true },
    courses: [courses_schema],
  },
  { collection: "students" }
);

// create mongoose's model object & export object model -- >>
module.exports = global.academy_db.model("", student_schema);
