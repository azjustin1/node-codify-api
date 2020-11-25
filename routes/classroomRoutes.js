import express from "express";
import passport from "passport";

// Models
import User from "../models/User";
import Classroom from "../models/Classroom";
import Exercise from "../models/Exercise";

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
router.get("/:alias", async (req, res) => {
  const classroom = await Classroom.findOne({ alias: req.params.alias });
  if (!classroom) return res.status(404).send({ message: "Not found" });

  res.status(200).json(classroom);
});

// Attend to new class by classroom join id
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

/* Only teacher account get access */
// Classroom manage routes
router.post("/create", passport.authorize("teacher"), async (req, res) => {
  const newClassroom = new Classroom(req.body);
  const user = await User.findById(req.user.id);
  newClassroom.teacher = user;
  newClassroom.save();
  res.status(200).send(newClassroom);
});

router.put(
  "/:alias/update",
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

router.delete(
  "/:alias/delete",
  passport.authorize("teacher"),
  async (req, res) => {
    const deleteClassroom = await Classroom.findOneAndDelete({
      alias: req.params.alias,
    });

    if (!deleteClassroom) {
      return res.status(501);
    }

    return res.status(200).end();
  }
);

// Exercise manage routes
router.get("/:alias/exercise", async (req, res) => {
  const classroom = await Classroom.findOne({ alias: req.params.alias });
  const exercises = await Exercise.find({
    classroom: classroom._id,
  });
  res.status(200).send(exercises);
});

router.get("/:alias/exercise/:id", async (req, res) => {
  const exercises = await Exercise.findById(req.params.id);
  res.status(200).send(exercises);
});

router.post("/:alias/exercise/add", async (req, res) => {
  const user = await User.findById(req.user.id);
  const classroom = await Classroom.findOne({ alias: req.params.alias });
  const exercise = new Exercise({
    title: req.body.title,
    content: req.body.content,
    testCase: req.body.testCase,
    creator: user,
    classroom: classroom,
  });

  try {
    await exercise.save();
    res.status(200).send(exercise);
  } catch (err) {
    res.status(501).send(err.message);
  }
});

router.put("/:alias/exercise/update/:id", async (req, res) => {
  const updateExercise = await Exercise.findByIdAndUpdate(
    req.params.id,
    {
      title: req.body.title,
      content: req.body.content,
      testCase: req.body.testCase,
    },
    { new: true }
  );

  try {
    await updateExercise.save();
    res.status(200).send(updateExercise);
  } catch (err) {
    res.status(501).send(err.message);
  }
});

router.delete("/:alias/exercise/delete/:id", async (req, res) => {
  const deleteExercise = await Exercise.findByIdAndDelete(req.params.id);

  if (!deleteExercise) {
    return res.status(501).end();
  }

  return res.status(200).end();
});

/* -----------------------------------  */

export default router;
