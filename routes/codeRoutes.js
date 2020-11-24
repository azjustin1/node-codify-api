/*  */

import express from "express";
import { exec } from "child_process";
import sandBox from "../libs/sandbox";

const router = express.Router();

router.post("/run", (req, res) => {
  // Pass user code to sandbox
    
  res.status(200).send("This is your post");
});

router.post("/submit", (req, res) => {});

export default router;
