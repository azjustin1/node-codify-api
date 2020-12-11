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
  testCasesPass: [],
  studentCode: { type: String },
  score: {
    type: Number,
    default: 0,
  },
});

resultSchema.methods.getTotalPoint = function () {
  let sumPoint = 0;
  for (const testCase of this.testCasesPass) {
    sumPoint += testCase.point;
  }
  return sumPoint;
};

export default mongoose.model("Result", resultSchema);
