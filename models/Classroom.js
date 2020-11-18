import mongoose from "mongoose";

const Schema = mongoose.Schema;

const classroomSchema = new Schema({
  joinId: {
    type: String,
    default: () => {
      return Math.random().toString(36).substring(6);
    },
  },
  teacher: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  title: {
    type: String,
    min: 6,
    max: 255,
    required: true,
  },
  description: {
    type: String,
    min: 6,
    required: true,
  },
  students: [
    {
      studentId: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    },
  ],
});

export default mongoose.model("Classroom", classroomSchema);
