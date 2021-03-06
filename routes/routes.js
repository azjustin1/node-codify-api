import express from "express";
import passport from "passport";
import dotenv from "dotenv";
import JWT from "jsonwebtoken";

// import { io } from '../server'
//This is custom passport
import auth from "../middleware/auth";

// Models
import User from "../models/User";
import Classroom from "../models/Classroom";

dotenv.config();

const router = express.Router();

router.get("/", (req, res) => {
  res.status(200).send({ message: "express is up" });
});

router.get("/authenticate", async (req, res) => {
  const accessToken = await JWT.verify(
    req.headers.authorization.replace("Bearer ", ""),
    process.env.SECRET_TOKEN
  );
  if (!accessToken) {
    return res.status(401).send({ message: "Unauthorized" });
  }

  res.status(200).send(accessToken.payload);
});

router.post("/signup", (req, res, next) => {
  passport.authenticate(
    "signup",
    {
      session: false,
      badRequestMessage: "Please enter all the information",
    },
    async (err, user, info) => {
      if (err) return res.status(422).send(info);
      // Send confirmation email

      return res.status(200).send(info);
    }
  )(req, res, next);
});

router.post("/signin", (req, res, next) => {
  passport.authenticate(
    "signin",
    {
      session: false,
      badRequestMessage: "Please enter email and password to sign in",
    },
    async (err, user, info) => {
      if (err || !user) {
        return res.status(422).send(info);
      }
      req.login(user, { session: false }, (err) => {
        if (err) res.status(403).send(err);
        // Receive access token from passport middleware and send to client
        return res.status(200).send(info);
      });
    }
  )(req, res, next);
});

// Activate account after confirmed email
router.get("/activate/:activationToken", (req, res) => {
  const activationToken = JWT.verify(
    req.params.activationToken,
    process.env.SECRET_TOKEN
  );
  User.findOne({ email: activationToken.email }, (err, user) => {
    if (err) return res.status(401);
    user.active = activationToken.active;
    user.save();
    res
      .status(200)
      .send({ message: "Your account has been activated successfully" });
  });
});

// Search classrooms or exercises
router.get("/search", async (req, res) => {
  const foundClassroom = await Classroom.find({
    title: { $regex: req.query.classrooms, $options: "i" },
  });

  if (foundClassroom.length === 0)
    return res.status(404).send({ message: "Not found" });

  res.status(200).send(foundClassroom);
});

export default router;
