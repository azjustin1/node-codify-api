import express from "express";
import fs from "fs";
import sandbox from "../services/DockerSandbox";
import { exec } from "child_process";

const router = express.Router();

router.post("/run", async (req, res) => {
  let path = __dirname.replace(/\\/g, "/");

  fs.mkdir("temp", { recursive: true }, (err) => {
    if (err) res.send(err);
    const compiler = req.body.compiler;
    const codeFile = "code" + req.user.id + "." + req.body.language;
    const writeCodeFile = fs.createWriteStream(__dirname + "/temp/" + codeFile);
    writeCodeFile.write(req.body.code);
    writeCodeFile.end();
    // Create user input file in temp folder and the name is input + user id
    const inputFile = "input" + req.user.id + ".txt";
    const writeInputFile = fs.createWriteStream(
      __dirname + "/temp/" + inputFile
    );
    writeInputFile.write(req.body.input);
    writeInputFile.end();
    const outputFile = "output" + req.user.id;
    const runCommand =
      "sh " +
      path +
      "/run-docker.sh " +
      path +
      "/temp " +
      compiler +
      " " +
      codeFile +
      " " +
      inputFile +
      " " +
      outputFile;
    // console.log(runCommand);
    exec(runCommand, (err, stdout, stderr) => {
      console.log(err);
      if (stderr) {
        fs.unlinkSync(__dirname + "/temp/" + codeFile);
        fs.unlinkSync(__dirname + "/temp/" + inputFile);
        if (fs.existsSync(__dirname + "/temp/" + outputFile)) {
          fs.unlinkSync(__dirname + "/temp/" + outputFile);
        }
        return res.status(501).send(stderr);
      }
      const output = stdout;
      fs.unlinkSync(__dirname + "/temp/" + codeFile);
      fs.unlinkSync(__dirname + "/temp/" + inputFile);
      if (fs.existsSync(__dirname + "/temp/" + outputFile)) {
        fs.unlinkSync(__dirname + "/temp/" + outputFile);
      }
      res.status(200).send(output);
    });
  });
});

export default router;
