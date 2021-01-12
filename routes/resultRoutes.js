import express from "express";

// Models
import Result from "../models/Result";

import Exercise from "../models/Exercise";

const router = express.Router({ mergeParams: true });

router.get("/", async (req, res) => {
  const exercise = await await Exercise.find({
    _id: req.params.id,
  });

  if (!exercise) {
    return res.status(404).send({ message: "Not Found" });
  }

  const results = await Result.find({
    exercise: exercise,
  }).populate("student", "-password");

  res.status(200).send(results);
});

router.get("/:exerciseId", async (req, res) => {
  const exercise = await await Exercise.find({
    _id: req.params.id,
  });

  if (!exercise) {
    return res.status(404).send({ message: "Not Found" });
  }

  const result = await Result.findOne({
    exercise: exercise,
    _id: req.params.exerciseId,
  }).populate("student", "-password");

  if (!result) {
    return res.status(404).send({ message: "Not Found" });
  }

  res.status(200).send(result);
});

router.put("/:exerciseId", async (req, res) => {
  const exercise = await await Exercise.find({
    _id: req.params.id,
  });

  if (!exercise) {
    return res.status(404).send({ message: "Not Found" });
  }

  const updateResult = await Result.findOneAndUpdate(
    {
      exercise: exercise,
      _id: req.params.exerciseId,
    },
    { score: req.body.score },
    { new: true }
  ).populate("student", "-password");

  if (!updateResult) {
    return res.status(404).send({ message: "Not Found" });
  }

  //   await updateResult.save();

  return res.status(200).send(updateResult);
});

export default router;
