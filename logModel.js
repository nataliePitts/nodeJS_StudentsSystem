//Import Mongoose framework >>
const mongoose = require("mongoose");

// << -- Creating a Schema for log -- >>
var log_schema = new mongoose.Schema(
  {
    method: { type: String, lowercase: true, enum: ["post", "get"] },
    path: { type: String },
    runmode: { type: String, lowercase: true, enum: ["html", "json"] },
    when: { type: Date, default: Date.now },
  },
  { collection: "log" }
);
// create mongoose's model object & export object model -- >>
module.exports = global.academyLog_db.model("", log_schema);
