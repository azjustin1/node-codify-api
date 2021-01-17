import express from "express";
import passport from "passport";

const router = express.Router({ mergeParams: true });

// Models
import User from "../models/User";
import Classroom from "../models/Classroom";
import Exercise from "../models/Exercise";
import Result from "../models/Result";
import Attended from "../models/Attended";

// Get all exercises in class
router.get("/", async (req, res) => {
  const classroom = await Classroom.findOne({ alias: req.params.alias });

  if (!classroom) {
    return res.status(404).send({ message: "Not Found" });
  }

  const exercises = await Exercise.find({
    classroom: classroom._id,
  });

  res.status(200).send(exercises);
});

// Get exercise by Id
router.get("/:id", async (req, res) => {
  const classroom = await Classroom.findOne({ alias: req.params.alias });

  const exercise = await Exercise.findOne({
    _id: req.params.id,
    classroom: classroom,
  });

  if (classroom.teacher != req.user.id) {
    const attended = await Attended.findOne({
      student: req.user.id,
      classroom: classroom,
    });

    if (!attended) {
      return res.status(403).send({ message: "Unauthorized" });
    }
  }

  if (!exercise || !classroom) {
    return res.status(404).send({ message: "Not found" });
  }

  res.status(200).send(exercise);
});

/** Only Teacher can use these routes **/

// Add new exercise to the class
router.post("/create", passport.authorize("teacher"), async (req, res) => {
  const creator = await User.findById(req.user.id);
  // The classroom where exercise is added
  const classroom = await Classroom.findOne({ alias: req.params.alias });

  const exercise = new Exercise({
    title: req.body.title,
    content: req.body.content,
    testCases: req.body.testCase,
    expiredTime: req.body.expireTime,
    creator: creator,
    classroom: classroom,
  });

  try {
    await exercise.save();
    res.status(200).send(exercise);
  } catch (err) {
    res.status(501).send(err.message);
  }
});

/**
 * This update exercise information with new data
 * @param title String
 * @param content String
 * @param testCase[]
 */
router.put("/:id", passport.authorize("teacher"), async (req, res) => {
  try {
    const updateExercise = await Exercise.findByIdAndUpdate(
      req.params.id,
      {
        title: req.body.title,
        content: req.body.content,
        testCase: req.body.testCases,
      },
      { new: true }
    );
    await updateExercise.save();
    res.status(200).send(updateExercise);
  } catch (err) {
    res.status(501).send({ message: "Not Found" });
  }
});

// Delete exercise by classroom
router.delete(
  "/delete/:id/:classroom",
  passport.authorize("teacher"),
  async (req, res) => {
    try {
      await Exercise.findByIdAndDelete(req.params.id);
      res.status(200).send({ message: "Successfully" });
    } catch (err) {
      res.status(501).send({ message: "Not Found" });
    }
  }
);

export default router;
