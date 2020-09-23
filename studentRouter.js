//Necessary moudels >>
const express = require("express");
const studentRoutes = express.Router();
let StudentModel = require("../models/studentModel");
const bodyParser = require("body-parser");
var urlencodedParser = bodyParser.urlencoded({ extended: false });

// << -- Get home page -->>
studentRoutes.get("/", function (req, res) {
  var toar_type = { BA: false, MA: false, PHD: false };
  var min_avg = req.params.min_avg;
  StudentModel.find({}, function (err, students) {
    //Checks running mode and acts according to the mode >>
    if (!err) {
      if (global.runmode === "json") {
        res.setHeader("Content-Type", "application/json");
        res.json(JSON.stringify(students));
      } else {
        res.render("index.pug", {
          students: students,
          toar_type: toar_type,
          min_avg: min_avg,
        });
      }
    } else {
      res.send("Could not retrieve users");
    }
  });
});

// << -- After filter Result -- >>
studentRoutes.post("/", function (req, res) {
  console.log("search ", req.body);
  var toar_type = { BA: false, MA: false, PHD: false };
  var { city, toar, min_avg } = req.body;
  //Object filter: $expr with and action >>
  var filter = { $expr: { $and: [] } };
  if (city.trim() != "") {
    // If city is not empty add it to the filter >>
    filter["$expr"]["$and"].push({ $eq: ["$city", city] });
  }
  if (toar && toar.trim() != "all") {
    // If toar is not empty add it to the filter >>
    filter["$expr"]["$and"].push({ $eq: ["$toar", toar] });
  }
  if (min_avg.trim() != "") {
    // If min AVG is not empty add it to the filter >>
    filter["$expr"]["$and"].push({
      $gte: [{ $avg: "$courses.grade" }, parseInt(min_avg)],
    });
  }
  StudentModel.find(filter, function (err, students) {
    toar_type[toar] = true;
    if (!err) {
      //Checks running mode and acts according to the mode >>
      if (global.runmode === "json") {
        res.setHeader("Content-Type", "application/json");
        res.json(JSON.stringify(filter));
      } else {
        console.log("search result students", students);
        res.render("index.pug", {
          students: students,
          toar_type: toar_type,
          city: city,
          min_avg: min_avg,
        });
      }
    } else {
      res.send("Could not retrieve users");
    }
  });
});

// (C) Create a new student >> Get page
studentRoutes.get("/add", function (req, res) {
  console.log("Open add page");
  console.log(req.body);
  var id = null;
  var toar_type = { BA: false, MA: false, PHD: false };
  res.render("addStudent.pug", { id: id, toar_type: toar_type });
});
// (C) Create a student >> Add to DB
studentRoutes.post("/add", urlencodedParser, function (req, res) {
  var s_id = req.body.id.trim();
  var s_name = req.body.name.trim();
  var s_city = req.body.city.trim();
  var toar = req.body.toar;
  var toar_type = { BA: false, MA: false, PHD: false };
  toar_type[toar] = true;
  var add_Student = new StudentModel(req.body);
  var note = "ההוספה בוצעה בהצלחה!";
  add_Student.save(function (err, details_student) {
    let error = null;
    if (err) {
      error = err.message;
      console.log("ERROR: can not saving student", err.message);
    }
    //Checks running mode and acts according to the mode >>
    if (global.runmode === "json") {
      res.setHeader("Content-Type", "application/json");
      res.send(JSON.stringify(details_student));
    } else {
      console.log("The process succesed - Add new Student:");
      console.log(details_student);
      res.render("addStudent.pug", {
        id: s_id,
        name: s_name,
        city: s_city,
        toar_type: toar_type,
        note,
        error,
      });
    }
  });
});

// (D) Delete a student >>
studentRoutes.post("/delete/:id", function (req, res) {
  let ids = req.params.id;
  console.log("Asked to delete a student: ", req.params.id);
  StudentModel.deleteOne({ id: ids }, function (err) {
    if (!err) {
      //Checks running mode and acts according to the mode >>
      if (global.runmode === "json") {
        res.setHeader("Content-Type", "application/json");
        res.send(JSON.stringify("1"));
      } else {
        console.log(req.params.id, ": is deleted !");
        res.redirect("http://localhost:8080/student");
      }
    } else {
      // if was error >>
      if (global.runmode === "json") {
        res.send(JSON.stringify("0"));
      } else {
        res.redirect("http://localhost:8080/student");
      }
    }
  });
});

// (U) Update Students Details >>
//Get page with all the Details -->>
studentRoutes.get("/update/:id", urlencodedParser, function (req, res) {
  console.log("Asked to update student details");
  StudentModel.findOne({ id: req.params.id }, function (err, students) {
    //console.log(students);
    let uid = students.id;
    let uname = students.name;
    let ucity = students.city;
    let utoar = students.toar;
    let cous = students.courses;
    if (!err) {
      res.render("updateStudent.pug", {
        id: uid,
        name: uname,
        city: ucity,
        toar: utoar,
        courses: cous,
      });
    } else {
      res.send("Could not retrieve users");
    }
  });
});

//After Update and Add courses -->>
studentRoutes.post("/update/:id", urlencodedParser, async function (req, res) {
  try {
    console.log("Asked to update a new course");
    var courseid = req.body.courseid.trim();
    var grade = req.body.grade.trim();
    var add_course = { courseid, grade };
    var note = "ההוספה בוצעה בהצלחה!";
    //
    var student = await StudentModel.findOne({ id: req.params.id });
    console.log("student", student);
    student.courses.push(add_course);
    await student.save();

    console.log("Add a new course - the process succesed");
    //Checks running mode and acts according to the mode >>
    if (global.runmode === "json") {
      res.json(student);
    } else {
      res.render("updateStudent.pug", {
        id: student.id,
        name: student.name,
        city: student.city,
        toar: student.toar,
        courses: student.courses,
      });
    }
  } catch (err) {
    // when error >>
    console.log("update student error", err.message);
    if (global.runmode === "json") {
      res.json("fail");
    } else {
      error = err.message;
      res.render("updateStudent.pug", {
        id: student.id,
        name: student.name,
        city: student.city,
        toar: student.toar,
        courses: student.courses,
        error: "הציון הינו מספר בין 0 ל- 100",
      });
    }
  }
});

//Export students
studentRoutes.use("/student", studentRoutes);
module.exports = studentRoutes;
