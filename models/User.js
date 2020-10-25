import mongoose from "mongoose";
import bcrypt from "bcrypt";
import Joi, { boolean } from "joi";
import JWT from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  imgUrl: {
    type: String,
  },
  active: {
    type: Boolean,
    default: false,
  },
});

userSchema.pre("save", function (next) {
  // Check if the user already have password
  if (!this.isModified("password")) {
    return next();
  }
  // Hash the password before save user
  bcrypt.genSalt(10, async (err, salt) => {
    if (err) return next(err);
    bcrypt.hash(this.password, salt, (err, hash) => {
      if (err) return next(err);
      this.password = hash;
      return next();
    });
  });
});

// Validate user input
userSchema.methods.Validate = function (obj) {
  const schema = Joi.object().keys({
    email: Joi.string().email().min(6).required(),
    password: Joi.string().min(6).required(),
  });
  const validation = schema.validate(obj);
  return validation;
};

userSchema.methods.comparePassword = function (candidatePassword, next) {
  const password = this.password;
  bcrypt.compare(candidatePassword, password, function (err, isMatch) {
    if (err) {
      console.log("Wrong password");
      next(null, false);
    }
    return next(null, isMatch);
  });
};

userSchema.methods.generateAccessToken = function () {
  console.log(this.email, this.active);
  const payload = { _id: this._id, email: this.email, active: this.active };
  const token = JWT.sign({ payload: payload }, process.env.SECRET_TOKEN, {
    expiresIn: 3600,
  });
  return token;
};

export default mongoose.model("User", userSchema);
