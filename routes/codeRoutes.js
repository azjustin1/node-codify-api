import express from "express";
import SandBox from "../DockerSandbox/DockerSandbox";

// Models
import User from "../models/User";
import Exercise from "../models/Exercise";
import Result from "../models/Result";

const router = express.Router();

let folder = "temp";

router.post("/run", async (req, res) => {
  let inputs = [];
  let outputs = [];
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

router.post("/submit", async (req, res) => {
  let inputs = [];
  let outputs = [];

  const exerciseId = req.body.exerciseId;
  const exercise = await Exercise.findById(exerciseId);

  const student = await User.findById(req.user.id);
  const language = req.body.language;
  const compiler = req.body.compiler;
  const code = {
    codeContent: req.body.code,
    codeFileName: "code" + req.user.id,
  };

  let result = await Result.findOne({ student: student, exercise: exercise });

  if (!result) {
    result = new Result({
      student: student,
      exercise: exercise,
      testCases: exercise.testCases,
      studentCode: req.body.code,
    });
    await result.save();
  }

  for (const [i, testCase] of result.testCases.entries()) {
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

  sandBox.run(async (testResults) => {
    testResults.forEach(async (testResult, i) => {
      result.testCases.forEach(async (testCase, i) => {
        if (
          testCase.input === testResult.input &&
          testCase.output === testResult.output &&
          testCase.timeLimit >= testResult.runTime
        ) {
          await Result.update(
            {
              student: student,
              exercise: exercise,
              "testCases.input": testResult.input,
              "testCases.output": testResult.output,
            },
            {
              $set: {
                "testCases.$.actualOutput": testResult.output,
                "testCases.$.pass": true,
                "testCases.$.message": "Correct",
              },
            }
          );
        }

        if (
          testCase.input === testResult.input &&
          testCase.output !== testResult.output &&
          testCase.timeLimit >= testResult.runTime
        ) {
          await Result.update(
            {
              student: student,
              exercise: exercise,
              "testCases.input": testResult.input,
            },
            {
              $set: {
                "testCases.$.actualOutput": testResult.output,
                "testCases.$.pass": false,
                "testCases.$.message": "Incorrect",
              },
            }
          );
        }

        if (
          testCase.input === testResult.input &&
          testCase.timeLimit < testResult.runTime
        ) {
          await Result.update(
            {
              student: student,
              exercise: exercise,
              "testCases.input": testResult.input,
              "testCases.output": testResult.output,
            },
            {
              $set: {
                "testCases.$.actualOutput": testResult.output,
                "testCases.$.pass": false,
                "testCases.$.message": "Over Time",
              },
            }
          );
        }
      });

      // Send to the client after check all test case
      if (i === testResults.length - 1) {
        const updateResult = await Result.findOne({
          student: student,
          exercise: exercise,
        });
        res.send({
          point: updateResult.getTotalPoint(),
          testResults: updateResult,
        });
      }
    });
  });
});

export default router;
