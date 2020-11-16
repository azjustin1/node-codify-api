import mongoose from "mongoose";
import bcrypt from "bcrypt";
import Joi from "joi";
import JWT from "jsonwebtoken";
import dotenv from "dotenv";
import transporter from "../config/emailConfig";

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
  role: {
    type: String,
    enum: ["admin", "user"],
  },
});

userSchema.pre("save", function (next) {
  // Check if the user already have password
  if (!this.isModified("password")) {
    return next();
  }
  // This is for new user from admin
  if (this.password !== null) {
    console.log("user already have hash password");
    return next();
  }

  // Hash the password before save user
  bcrypt.genSalt(10, async (err, salt) => {
    if (err) {
      console.log(err);
      return next(err);
    }
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

userSchema.methods.comparePassword = function (confirmPassword, next) {
  bcrypt.compare(confirmPassword, this.password, function (err, isMatch) {
    if (err) {
      next(null, false);
    }
    return next(null, isMatch);
  });
};

userSchema.methods.generateAccessToken = function () {
  // This contain user information to authenticate
  const payload = {
    email: this.email,
    active: this.active,
    role: this.role,
  };
  const token = JWT.sign({ payload: payload }, process.env.SECRET_TOKEN, {
    expiresIn: 3600,
  });
  return token;
};

userSchema.methods.sendConfirmEmail = function (data, next) {
  const confirmEmail = {
    from: process.env.EMAIL,
    to: this.email,
    subject: "Activate",
    html: data,
  };
  transporter.sendMail(confirmEmail, (error, info) => {
    if (error) {
      next(null, false);
    }
    return next(null, info);
  });
};

userSchema.methods.verifyEmail = function (token) {
  JWT.verify(token, process.env.SECRET_TOKEN);
};

export default mongoose.model("User", userSchema);
