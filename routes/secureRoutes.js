import express from "express";
import cloudinary from "cloudinary";
import fs from "fs";
const router = express.Router();

// Models
import User from "../models/User";

//Displays information tailored according to the logged in user
router.get("/", (req, res) => {
  // //We'll just send back the user details and the token
  User.findOne({ email: req.user.email }, (err, user) => {
    res.send(user);
  });
});

// MULTER
import multer from "multer";

const storage = multer.diskStorage({});

// This route will upload file to cloudinary
router.post("/upload", (req, res, next) => {
  const upload = multer({ storage }).single("image");
  upload(req, res, function (err) {
    if (err) {
      return res.send(err);
    }
    // SEND FILE TO CLOUDINARY
    cloudinary.v2.config({
      cloud_name: "gymmerify",
      api_key: process.env.CLOUDINARY_KEY,
      api_secret: process.env.CLOUDINARY_SECRET,
    });

    const path = req.file.path;

    cloudinary.uploader.upload(path, (image) => {
      if (!image) {
        return res.status(400).send("Upload failed");
      }
      // remove file from server if don't remove it will save image in server folder
      fs.unlinkSync(path);
      User.findOne({ _id: req.user._id }, (err, user) => {
        console.log(user);
        if (err) {
          res.status(400).send(err.message);
        }
        user.imgUrl = image.url;
        user.save();
        return res.status(200).send("Upload successfully");
      });
    });
  });
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
