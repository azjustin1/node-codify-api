import mongoose from "mongoose";

const Schema = mongoose.Schema;

const testSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  exercise: [
    {
      type: Schema.Types.ObjectId,
      ref: "Exercise",
    },
  ],
  dueTime: {
    type: Date,
    default: null,
  },
  expired: {
    type: Boolean,
    default: false,
  },
});

export default mongoose.model("Test", testSchema);
