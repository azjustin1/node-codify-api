import express from "express";

const router = express.Router();

// Models
import Exercise from "../models/Exercise";

// Get all the exercise
router.get("/", async (req, res) => {
  console.log(req.params.alias);
  const exercises = await Exercise.find({});
  res.status(200).send(req.params.alias);
});

router.post("/add", (req, res) => {});

router.put("/update", (req, res) => {});

export default router;
