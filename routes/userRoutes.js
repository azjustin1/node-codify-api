import express from "express";
import cloudinary from "cloudinary";
import fs from "fs";
const router = express.Router();

// Models
import User from "../models/User";

//Displays information tailored according to the logged in user
router.get("/profile", (req, res) => {
  // //We'll just send back the user details and the token
  User.findOne({ email: req.user.email }, (err, user) => {
    if (err) return res.status(203);
    res.status(200).send(user);
  });
});

router.put("/change-password", async (req, res) => {
  User.findOne({ email: req.user.email }, async (err, user) => {
    if (err) return res.status(404);

    await user.comparePassword(req.body.currentPassword, (err, isMatch) => {
      if (!isMatch) {
        return res.send({ messages: "Wrong password" });
      }
      if (req.body.newPassword != req.body.confirmNewPassword) {
        return res.send({ message: "Confirm password not match" });
      }
      user.save();
      res.status(200).send({ message: "Change password successfully" });
    });
  });
});

router.post("/attend-classroom", (req, res) => {});

router.delete("/", (req, res) => {});

export default router;
