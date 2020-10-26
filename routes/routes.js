import express from "express";
import passport from "passport";
import dotenv from "dotenv";
import JWT from "jsonwebtoken";
import transporter from "../config/emailConfig";
// import { io } from '../server'
//This is custom passport
import authRouter from "../libs/authentication";

// Models
import User from "../models/User";

dotenv.config();

const router = express.Router();

router.get("/", (req, res) => {
  res.status(200).send({ message: "express is up" });
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
        if (err) res.status(403);
        // Receive access token from passport middleware and send to client
        return res.status(200).send(info);
      });
    }
  )(req, res, next);
});

// Activate account after confirmed email
router.get("/activate/:activateToken", (req, res) => {
  const decode = JWT.verify(req.params.activateToken, process.env.SECRET_TOKEN);
  User.findOne({ email: decode.email }, (err, user) => {
    if (err) return res.status(401);
    user.active = decode.active;
    user.save();
    res.status(200).send("Your account has been activated successfully");
  });
});

export default router;
