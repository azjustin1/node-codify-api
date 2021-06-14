import express from "express";
import cloudinary from "cloudinary";
import dotenv from "dotenv";
import multer from "multer";
import fs from "fs";

dotenv.config();
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

router.put("/profile", async (req, res) => {
	try {
		await User.findOneAndUpdate({ _id: req.user.id }, req.body);
		res.status(200).send({ message: "Update successfully" });
	} catch (error) {
		res.status(500).send({ message: error.message });
	}
});

const storage = multer.diskStorage({}); // This route will upload file to cloudinary
router.put("/change-avatar", (req, res, next) => {
	let path;
	const upload = multer({ storage }).single("image");
	upload(req, res, function (err) {
		if (err instanceof multer.MulterError) {
			return res.status(500).json(err);
		} else if (err) {
			return res.status(500).json(err);
		}
		// SEND FILE TO CLOUDINARY
		cloudinary.v2.config({
			cloud_name: "gymmerify",
			api_key: process.env.CLOUDINARY_KEY,
			api_secret: process.env.CLOUDINARY_SECRET,
		});
		const path = req.file.path;
		cloudinary.uploader.upload(path, async (image) => {
			if (!image) {
				return res.status(400).send("Upload failed");
			}
			// remove file from server if don't remove it will save image in server folder
			fs.unlinkSync(path);
			await User.findOneAndUpdate(
				{ _id: req.user.id },
				{
					imgUrl: image.url,
				}
			);
			return res.status(200).send("Upload successfully");
		});
	});
});

router.delete("/", (req, res) => {});

export default router;
