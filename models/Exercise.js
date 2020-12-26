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
    type: [
      {
        input: { type: String, required: true },
        output: { type: String, required: true },
        actualOutput: String,
        timeLimit: { type: Number, required: true, default: 3000 },
        point: { type: Number, required: true },
        pass: { type: Boolean, default: false },
        message: String,
      },
    ],
    validate: [
      (testCases) => {
        var sumPoint = 0;
        for (const testCase of testCases) {
          sumPoint += testCase.point;
        }
        return sumPoint == 100;
      },
      "This exercise must be 100 points",
    ],
  },
  point: {
    type: Number,
  },
  creator: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  createAt: {
    type: Date,
    default: Date.now(),
  },
  expiredTime: {
    type: Date,
  },
  classroom: {
    type: Schema.Types.ObjectId,
    ref: "Classroom",
  },
});

exerciseSchema.pre("save", function (next) {
  var sumPoint = 0;
  for (const testCase of this.testCases) {
    sumPoint += testCase.point;
  }

  this.point = sumPoint;
  next();
});

export default mongoose.model("Exercise", exerciseSchema);
