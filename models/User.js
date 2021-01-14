import mongoose from "mongoose";
import bcrypt from "bcrypt";
import Joi from "joi";
import JWT from "jsonwebtoken";
import dotenv from "dotenv";
import transporter from "../config/emailConfigs";

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
  firstName: {
    type: String,
    required: true,
  },

  lastName: {
    type: String,
    required: true,
  },

  dateOfBirth: {
    type: Date,
    required: true,
    validate: [
      (date) => {
        return new Date(Date.now()) - new Date(date) >= 0;
      },
      "Invalid date",
    ],
  },

  imgUrl: {
    type: String,
    default: null,
  },
  active: {
    type: Boolean,
    default: false,
  },
  role: {
    type: String,
    enum: ["admin", "student", "teacher"],
    default: "student",
  },
});

userSchema.pre("save", function (next) {
  // Check if the user already have password
  if (!this.isModified("password")) {
    return next();
  }

  // Hash the password before save user
  bcrypt.genSalt(10, (err, salt) => {
    if (err) {
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
    confirmPassword: Joi.string(),
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    dateOfBirth: Joi.date().required(),
  });
  const validation = schema.validate(obj);
  return validation;
};

userSchema.methods.comparePassword = async function (inputPassword) {
  const isMatch = await bcrypt.compare(inputPassword, this.password);
  if (!isMatch) {
    return false;
  }
  return true;
};

userSchema.methods.generateAccessToken = function () {
  // This contain user information to authenticate
  const payload = {
    id: this._id,
    email: this.email,
    firstName: this.firstName,
    lastName: this.lastName,
    dateOfBirth: this.dateOfBirth,
    imgUrl: this.imgUrl,
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
