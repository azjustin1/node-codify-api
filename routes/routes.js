import express from "express";
import passport from "passport";
import dotenv from "dotenv";
import JWT from "jsonwebtoken";
import { execFile, spawn, exec } from "child_process";
import fs from "fs";
import transporter from "../config/emailConfig";
// import { io } from '../server'
//This is custom passport
import auth from "../libs/auth";

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
router.get("/activate/:activationToken", (req, res) => {
  const activationToken = JWT.verify(
    req.params.activationToken,
    process.env.SECRET_TOKEN
  );
  User.findOne({ email: activationToken.email }, (err, user) => {
    if (err) return res.status(401);
    user.active = activationToken.active;
    user.save();
    res.status(200).send("Your account has been activated successfully");
  });
});

router.post("/run", (req, res, next) => {
  // Get code from the client and write to a file
  const fileName = "code.c";
  const writeCodeFile = fs.createWriteStream(fileName);
  writeCodeFile.write(req.body.code);
  writeCodeFile.end();
  // Get input from user test
  const input = "input.txt";
  const writeInputFile = fs.createWriteStream(input);
  writeInputFile.write(req.body.input);
  writeInputFile.end();
  // Build created code file and make it runnable
  const child = execFile(
    "gcc",
    [fileName, "-o", "code"],
    (error, stdout, stderr) => {
      // Send the compile error to user
      if (error) {
        console.log(stdout);
        res.status(501).send(stderr);
        // If compile success
      } else {
        // Run code.exe and send the result to the client
        const child = execFile(
          // This is code run for window server
          "cmd",
          ["/c", "code.exe<input.txt"],
          // If linux server use this "./code<input.txt"
          (error, stdout, stderr) => {
            if (error) {
              throw error;
            }
            // This is the result after run code
            const result = stdout;
            // Delete files have been created after send to the user
            try {
              fs.unlinkSync("./code.exe");
              fs.unlinkSync("./code.c");
              fs.unlinkSync("./input.txt");
              //file removed
            } catch (err) {
              console.error(err);
            }
            // Send the result to client
            res.status(200).send(result);
          }
        );
      }
    }
  );
});

export default router;
