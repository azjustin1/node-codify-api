import express from "express";
import passport from "passport";
import DockerSandbox from "../DockerSandbox/DockerSandbox";
import fs from "fs";
import { execFile } from "child_process";

const router = express.Router();

// Models
import User from "../models/User";
import Classroom from "../models/Classroom";
import Exercise from "../models/Exercise";

// Get all exercises in class
router.get("/:classroom", async (req, res) => {
  // Get the classroom to find all the exercise in this classroom
  const classroom = await Classroom.findOne({ alias: req.params.classroom });
  const exercises = await Exercise.find({
    classroom: classroom._id,
  });
  res.status(200).send(exercises);
});

// Get exercise by Id
router.get("/:id/:classroom", async (req, res) => {
  try {
    const exercise = await Exercise.findById(req.params.id);
    res.status(200).send(exercise);
  } catch (err) {
    return res.status(404).send({ message: "Not found" });
  }
});

/** Only Teacher can use these routes **/

// Add new exercise to the class
router.post(
  "/add/:classroom",
  passport.authorize("teacher"),
  async (req, res) => {
    const creator = await User.findById(req.user.id);
    // The classroom where exercise is added
    const classroom = await Classroom.findOne({ alias: req.params.classroom });
    const exercise = new Exercise({
      title: req.body.title,
      content: req.body.content,
      testCases: req.body.testCase,
      creator: creator,
      classroom: classroom,
    });

    try {
      await exercise.save();
      res.status(200).send(exercise);
    } catch (err) {
      res.status(501).send(err.message);
    }
  }
);

/**
 * This update exercise information with new data
 * @param title String
 * @param content String
 * @param testCase[]
 */
router.put(
  "/update/:id/:classroom",
  passport.authorize("teacher"),
  async (req, res) => {
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
  }
);

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
