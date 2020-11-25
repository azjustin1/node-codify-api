import { object } from "joi";
import mongoose from "mongoose";
import slug from "mongoose-slug-generator";

mongoose.plugin(slug);

const Schema = mongoose.Schema;

const exerciseSchema = new Schema({
  title: {
    type: String,
    min: 6,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  testCase: [
    {
      input: { type: String, required: true },
      output: { type: String, required: true },
      timeLimit: { type: Number, required: true, default: 3000 },
      message: String,
    },
  ],
  creator: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  classroom: {
    type: Schema.Types.ObjectId,
    ref: "Classroom",
  },
});

export default mongoose.model("Exercise", exerciseSchema);
