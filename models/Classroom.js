import mongoose from "mongoose";
import slugify from "slugify";

const Schema = mongoose.Schema;

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
  createAt: { type: Date, default: Date.now },
});

classroomSchema.pre("save", function (next) {
  console.log(this._id);
  this.alias = slugify(this.title, { lower: true, locale: "vi" });
  return next();
});

export default mongoose.model("Classroom", classroomSchema);
