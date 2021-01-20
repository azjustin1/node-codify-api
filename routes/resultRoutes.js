import express from "express";

// Models
import Result from "../models/Result";
import Classroom from "../models/Classroom";
import User from "../models/User";
import Attended from "../models/Attended";
import Exercise from "../models/Exercise";

const router = express.Router({ mergeParams: true });

router.get("/", async (req, res) => {
  const exerciseId = req.params.id;

  const results = await Result.find({
    exercise: exerciseId,
  }).populate("exercise").populate("student", "-password");

  res.status(200).send(results);
});

router.get("/:resultId", async (req, res) => {
  const classroom = await Classroom.findOne({
    alias: req.params.alias,
  }).populate("teacher", "-password");

  if (!classroom) return res.status(404).send({ message: "Not found" });

  if (classroom.teacher._id != req.user.id) {
    const attended = await Attended.findOne({
      student: req.user.id,
      classroom: classroom,
    });

    if (!attended) {
      return res.status(403).send({ message: "Unauthorized" });
    }
  }

  const exercise = await Exercise.findOne({
    _id: req.params.id,
  });

  if (!exercise) {
    return res.status(404).send({ message: "Not Found" });
  }

  const result = await Result.findOne({
    exercise: exercise,
    _id: req.params.resultId,
  }).populate("student", "-password");

  if (!result) {
    return res.status(404).send({ message: "Not Found" });
  }

  res.status(200).send(result);
});

router.put("/:resultId", async (req, res) => {
  const exercise = await await Exercise.find({
    _id: req.params.id,
  });

  if (!exercise) {
    return res.status(404).send({ message: "Not Found" });
  }

  const updateResult = await Result.findOneAndUpdate(
    {
      exercise: exercise,
      _id: req.params.resultId,
    },
    { score: req.body.score },
    { new: true }
  ).populate("student", "-password");

  if (!updateResult) {
    return res.status(404).send({ message: "Not Found" });
  }

  return res.status(200).send(updateResult);
});

export default router;
