import mongoose, { Mongoose } from "mongoose";

const Schema = mongoose.Schema;

const commentSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },

  room: {
    type: Schema.Types.ObjectId,
  },

  comment: {
    type: Schema.Types.ObjectId,
    ref: "Comment",
  },

  content: { type: String },

  timeStamp: {
    type: Date,
    default: () => {
      return new Date(Date.now());
    },
  },
});

export default mongoose.model("Comment", commentSchema);
