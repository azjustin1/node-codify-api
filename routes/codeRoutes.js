import express from "express";
import fs from "fs";
import SandBox from "../DockerSandbox/DockerSandbox";
import { exec } from "child_process";
import async from "async-es";

// Models
import User from "../models/User";
import Exercise from "../models/Exercise";
import Result from "../models/Result";

const router = express.Router();

let folder = "temp";
let codes = [];
let inputs = [];
let outputs = [];
let codeContent;
let codeFileName;
let inputContent;
let inputFileName;
let outputFileName;
let sandBoxes = [];
let output = [];

router.post("/run", async (req, res) => {
  const language = req.body.language;
  const compiler = req.body.compiler;

  const code = {
    codeContent: req.body.code,
    codeFileName: "code" + req.user.id,
  };

  const input = {
    inputContent: req.body.input,
    inputFileName: "input" + req.user.id,
  };
  inputs.push(input);

  const output = "output" + req.user.id;
  outputs.push(output);

  const sandBox = new SandBox(
    folder,
    code,
    inputs,
    outputs,
    language,
    compiler
  );

  sandBox.run((result) => {
    res.send(result);
  });
});

const testCode = async (student, testCases, compiler) => {
  let result = [];
  let sandBox;
  for (let i = 0; i < 1000; i++) {
    result.push(i);
  }
  return result;
};

router.post("/submit", async (req, res) => {
  const exerciseId = req.body.exerciseId;
  const exercise = await Exercise.findById(exerciseId);
  const student = await User.findById(req.user.id);
  const language = req.body.language;
  const compiler = req.body.compiler;

  const code = {
    codeContent: req.body.code,
    codeFileName: "code" + req.user.id,
  };
  for (const [i, testCase] of exercise.testCases.entries()) {
    const input = {
      inputContent: testCase.input,
      inputFileName: "input" + req.user.id + i,
    };
    inputs.push(input);
    const output = "output" + req.user.id;
    outputs.push(output);
  }

  const sandBox = new SandBox(
    folder,
    code,
    inputs,
    outputs,
    language,
    compiler
  );

  sandBox.run((result) => {
    res.send(result);
  });
});

export default router;
