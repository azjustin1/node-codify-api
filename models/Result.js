import { boolean } from "joi";
import mongoose from "mongoose";

const Schema = mongoose.Schema;

const resultSchema = new Schema({
  student: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  exercise: {
    type: Schema.Types.ObjectId,
    ref: "Exercise",
  },
  testCases: {
    _id: false,
    type: [],
  },
  studentCode: { type: String },
  submitTime: {
    type: Date,
    default: () => {
      return new Date(Date.now());
    },
  },
  isLate: { type: Boolean, default: false },
  score: {
    type: Number,
    default: 0,
  },
});

resultSchema.methods.getTotalPoint = function () {
  let sumPoint = 0;
  for (const testCase of this.testCases) {
    if (testCase.pass) {
      sumPoint += testCase.point;
    }
  }
  return sumPoint;
};

export default mongoose.model("Result", resultSchema);
