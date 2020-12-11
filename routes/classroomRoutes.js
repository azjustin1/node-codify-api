import express from "express";
import passport from "passport";

// Models
import User from "../models/User";
import Classroom from "../models/Classroom";
import Attended from "../models/Attended";

const router = express.Router();

// Get all the created and joined classroom
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

// This route to get classroom information by their slug title
// Ex: This is title ---> this-is-title
router.get("/details/:alias", async (req, res) => {
  const classroom = await Classroom.findOne({ alias: req.params.alias });
  if (!classroom) return res.status(404).send({ message: "Not found" });
  return res.status(200).json(classroom);
});

// Attend to new class by classroom join id
router.post("/attend", async (req, res) => {
  const joinId = req.body.joinId;

  const classroom = await Classroom.findOne({ joinId: joinId });

  if (!classroom) {
    return res.status(404).send("Not found");
  }
  // Get the student want to attend to add to the classroom students[]
  const student = await User.findById(req.user.id);
  const attended = await Attended.findOne({
    classroom: classroom,
    student: student,
  });

  if (attended) {
    res.status(501).send("Already attended!");
  }

  attended = new Attended({
    classroom: classroom,
    student: student,
  });

  try {
    await attended.save();
    res.status(200).send(attended);
  } catch (err) {
    return res.status(501).send(err.message);
  }
});

/* Only teacher account get access */
/* Classroom manage routes */
router.post("/create", passport.authorize("teacher"), async (req, res) => {
  const newClassroom = new Classroom({
    title: req.body.title,
    description: req.body.description,
  });
  const creator = await User.findById(req.user.id);
  newClassroom.teacher = creator;
  try {
    await newClassroom.save();
    res.status(200).send(newClassroom);
  } catch (err) {
    res.status(501).send(err.message);
  }
});

/**
 * This route to update classroom information:
 * @param title String
 * @param description String
 **/
router.put(
  "/update/:alias",
  passport.authorize("teacher"),
  async (req, res) => {
    const updateClassroom = await Classroom.findOneAndUpdate(
      {
        alias: req.params.alias,
      },
      {
        title: req.body.title,
        description: req.body.description,
      },
      { new: true }
    );

    try {
      updateClassroom.save();
      res.send(updateClassroom);
    } catch (err) {
      return res.status(501).send(err.message);
    }
  }
);

// Delete classroom with alias
router.delete(
  "/delete/:alias",
  passport.authorize("teacher"),
  async (req, res) => {
    const deleteClassroom = await Classroom.findOneAndDelete({
      alias: req.params.alias,
    });

    if (!deleteClassroom) {
      return res.status(404).send({ message: "Not Found" });
    }

    const deleteAttendedClassrooms = await AttendedClassroom.deleteMany({
      classroom: deleteClassroom._id,
    });
    return res.status(200).send({ message: "Delete successfully" });
  }
);

export default router;
