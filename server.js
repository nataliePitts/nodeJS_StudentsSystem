//Necessary moudels >>
const bodyParser = require("body-parser"),
  express = require("express"),
  mongoose = require("mongoose");

//Creating a variable for express >>
var app = express();
// HTML mode >>
app.use(bodyParser.urlencoded({ extended: false }));
// JSON mode >>
app.use(bodyParser.json());

//Sets the running mode in a global variable >>
global.runmode = process.argv[2] ? process.argv[2].slice(3, 7) : "HTML";

//Pug engine >>
app.set("view engine", "pug");

//Asynchronous function that operates whenever a server is called
//mylogDB >> Records every time a request is made
var mylogDB = async function (req, res, next) {
  const logModel = require("./models/logModel");
  var method = req.method;
  var path = req.path;
  var runmode = global.runmode;
  //console.log("method, path, runmode", method, path);
  var add_log = new logModel({ method, path, runmode });
  console.log("Recording actions to Academy Log DB: ", add_log);
  add_log.save();
  await mylogDB;
  next();
};
app.use("/student", mylogDB);

//<< ------    Connecting to Data Bases :     ------- >>
//Connecting to Academy DB & becoming a global variable >>
global.academy_db = mongoose.createConnection(
  "mongodb://localhost:27017/academy",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);
//Error/Open cases >>
global.academy_db.on("error", function (err) {
  console.log("error conneting to Academy DB/server");
});
global.academy_db.on("open", function () {
  console.log("We have an opened connection to: Academy DB");
});

//Connecting to Academy Log DB + becoming a global variable >>
global.academyLog_db = mongoose.createConnection(
  "mongodb://localhost:27017/academylog",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);
//Error/Open cases >>
global.academyLog_db.on("error", function (err) {
  console.log("error conneting to Academy Log DB/server");
});
global.academyLog_db.on("open", function () {
  console.log("We have an opened connection to: Academy Log DB");
});

//Router for Students >>
const studentRoute = require("./routes/studentRouter");
app.use("/student", studentRoute);

//Open server on port 8080 >>
app.listen(8080, function () {
  console.log("Server started on port 8080");
  console.log("Runmode is: ", global.runmode);
});
