import { object } from "joi";
import mongoose from "mongoose";

const Schema = mongoose.Schema;

const exerciseSchema = new Schema({
  title: {
    type: String,
    min: 6,
    unique: true,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  testCases: {
    _id: false,
    type: [
      {
        input: { type: String, required: true },
        output: { type: String, required: true },
        actualOutput: String,
        timeLimit: { type: Number, required: true, default: 3000 },
        point: { type: Number, required: true, default: 20 },
        pass: { type: Boolean, default: false },
        message: String,
      },
    ],
    validate: [
      (testcases) => {
        var sumPoint = 0;
        for (const testcase of testcases) {
          sumPoint += testcase.point;
        }
        console.log(sumPoint);
        return sumPoint == 100;
      },
      "This exercise must be 100 points",
    ],
  },
  point: {
    type: Number,
    default: 10,
  },
  creator: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  createAt: {
    type: Date,
    default: Date.now(),
  },
  expireTime: {
    type: Date,
  },
  classroom: {
    type: Schema.Types.ObjectId,
    ref: "Classroom",
  },
});

export default mongoose.model("Exercise", exerciseSchema);
