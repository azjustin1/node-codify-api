import mongoose from "mongoose";

const Schema = mongoose.Schema;

const attendedSchema = new Schema({
  classroom: {
    type: Schema.Types.ObjectId,
    ref: "Classroom",
  },
  student: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});

export default mongoose.model("Attended", attendedSchema);
