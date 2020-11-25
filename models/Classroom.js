import mongoose from "mongoose";
import slug from "mongoose-slug-generator";

const Schema = mongoose.Schema;

mongoose.plugin(slug);

const classroomSchema = new Schema({
  joinId: {
    type: String,
    default: () => {
      return Math.random().toString(36).substring(6);
    },
  },
  title: {
    type: String,
    min: 6,
    max: 255,
    unique: true,
    required: true,
  },
  alias: {
    type: String,
    slug: "title",
    unique: true,
  },
  description: {
    type: String,
    min: 6,
    required: true,
  },
  teacher: {
    type: Schema.Types.ObjectId,
    ref: "User",
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
