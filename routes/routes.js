import express from "express";
import fs from "fs";
import { execFile } from "child_process";
import passport from "passport";
import JWT from "jsonwebtoken";
import dotenv from "dotenv";
// import { io } from '../server'
//This is custom passport
import authRouter from "./authRoutes";

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

router.post("/run", (req, res, next) => {
  const fileName = "code.c";
  const writeStream = fs.createWriteStream(fileName);
  // Get code from the client and write to a file
  writeStream.write(req.body.code);
  writeStream.end();
  // Build created code file and make it runnable
  const child = execFile(
    "gcc",
    [fileName, "-o", "code"],
    (error, stdout, stderr) => {
      if (error) {
        throw error;
      }
      console.log(stdout);

      // Run code.exe and send the result to the client
      const child = execFile("./code", (error, stdout, stderr) => {
        if (error) {
          throw error;
        }
        const result = stdout;
        // Delete 2 code files in the server after send
        try {
          fs.unlinkSync("./code.exe");
          fs.unlinkSync("./code.c");
          //file removed
        } catch (err) {
          console.error(err);
        }
        res.send(result);
      });
    }
  );
});

export default router;
