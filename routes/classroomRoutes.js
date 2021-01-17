import express from "express";
import passport from "passport";

// Models
import User from "../models/User";
import Classroom from "../models/Classroom";
import Attended from "../models/Attended";
import Exercise from "../models/Exercise";
import Result from "../models/Result";

const router = express.Router();

// Get all the created and joined classroom
router.get("/", async (req, res) => {
  try {
    const createdClassroom = await Classroom.find({
      teacher: req.user.id,
    }).populate("teacher");
    const attendedClassroom = await Attended.find({ student: req.user.id })
      .populate("student")
      .populate({
        path: "classroom",
        populate: { path: "teacher", select: { password: 0 } },
      });
    res.status(200).send({ createdClassroom, attendedClassroom });
  } catch (err) {
    res.send(err);
  }
});

router.get("/exercises/todo", async (req, res) => {
  let context = {
    notDoneExercises: [],
    doneExercises: [],
    lateSubmitExercises: [],
  };

  const attendedClassrooms = await Attended.find({
    student: req.user.id,
  });

  for (const attend of attendedClassrooms) {
    var curr = new Date;
    const exercises = await Exercise.find({ classroom: attend.classroom }).populate("classroom");
    for (const exercise of exercises) {
      const result = await Result.findOne({
        student: req.user.id,
        exercise: exercise._id,
      });

      if (result) {
        context.doneExercises.push(exercise);
      } else {
        if (curr > exercise.expiredTime) {
          context.lateSubmitExercises.push(exercise);
        } else {
          context.notDoneExercises.push(exercise);
        }
      }
    }
  }

  res.status(200).send(context);
});

// This route to get classroom information by their slug title
// Ex: This is title ---> this-is-title
router.get("/:alias", async (req, res) => {
  const classroom = await Classroom.findOne({
    alias: req.params.alias,
  }).populate("teacher", "-password");

  if (classroom.teacher._id != req.user.id) {
    const attended = await Attended.findOne({
      student: req.user.id,
      classroom: classroom,
    });

    if (!attended) {
      return res.status(403).send({ message: "Unauthorized" });
    }
  }

  if (!classroom) return res.status(404).send({ message: "Not found" });

  return res.status(200).json(classroom);
});

router.get("/:alias/attend", async (req, res) => {
  const classroom = await Classroom.findOne({ alias: req.params.alias });
  const attendedStudents = await Attended.find({
    classroom: classroom,
  })
    .populate("student")
    .populate("classroom");
  res.status(200).send(attendedStudents);
});

// Attend to new class by classroom join id
router.post("/attend", async (req, res) => {
  const joinId = req.body.joinId;

  const classroom = await Classroom.findOne({ joinId: joinId }).populate({
    path: "teacher",
    select: { password: 0 },
  });

  if (!classroom) {
    return res.status(404).send("Not found");
  }
  // Get the student want to attend to add to the classroom students[]
  const student = await User.findById(req.user.id).select("-password");

  console.log(req.user.id == classroom.teacher._id);

  if (req.user.id == classroom.teacher._id) {
    return res
      .status(403)
      .send({ message: "You are teacher of this classroom" });
  }

  let attended = await Attended.findOne({
    classroom: classroom,
    student: student,
  });

  if (attended) {
    return res.status(501).send({ message: "Already attended!" });
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
router.put("/:alias", passport.authorize("teacher"), async (req, res) => {
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
});

// Delete classroom with alias
router.delete("/:alias", passport.authorize("teacher"), async (req, res) => {
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
});

export default router;
