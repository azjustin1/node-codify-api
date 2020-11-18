import express from "express";
import passport from "passport";

// Models
import User from "../models/User";
import Classroom from "../models/Classroom";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const classroom = await Classroom.find({
      $or: [
        { students: { $elemMatch: { _id: req.user.id } } },
        { teacher: req.user.id },
      ],
    });
    res.status(200).send(classroom);
  } catch (err) {
    res.send(err);
  }
});

router.post("/create", passport.authorize("teacher"), async (req, res) => {
  const newClassroom = new Classroom(req.body);
  const user = await User.findById(req.user.id);
  newClassroom.teacher = user;
  newClassroom.save();
  res.status(200).send({ message: "Create classroom successfully" });
});

router.post("/attend", (req, res) => {
  const joinId = req.body.joinId;
  Classroom.findOne({ joinId: joinId }, async (err, classroom) => {
    if (err) return res.status(404);
    const student = await User.findById(req.user.id);
    classroom.students.push(student);
    classroom.save();
    student.attended.push(classroom);
    student.save();
    res.status(200).send({ message: "Attend successfully" });
  });
});

export default router;
