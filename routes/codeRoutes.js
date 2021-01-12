import express from "express";
import ExpressBrute from "express-brute";
import SandBox from "../DockerSandbox/DockerSandbox";

// Models
import User from "../models/User";
import Exercise from "../models/Exercise";
import Result from "../models/Result";

const router = express.Router();

let folder = "temp";

var store = new ExpressBrute.MemoryStore();
var bruteForce = new ExpressBrute(store);

router.post("/run", bruteForce.prevent, async (req, res) => {
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
    for (var i = 0; i < result.length; i++) {
      if (result[i].type === "error") {
        res.status(200).send(result);
        break;
      }

      if (i === result.length - 1) {
        res.status(200).send(result);
      }
    }
  });
});

router.post("/submit", bruteForce.prevent, async (req, res) => {
  let inputs = [];
  let outputs = [];
  let result;

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

  let testResults = [];

  async function getTestResults(next) {
    result = await Result.findOneAndUpdate(
      {
        student: student,
        exercise: exercise,
      },
      {
        student: student,
        exercise: exercise,
        testCases: exercise.testCases,
        studentCode: req.body.code,
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    const testCases = await Result.findOne({
      student: student,
      exercise: exercise,
    }).select("testCases");

    sandBox.run(async (data) => {
      testResults = data;
      for (var i = 0; i < testResults.length; i++) {
        // Break the loop if the code have compiler
        if (testResults[i].type === "error") {
          res.send(testResults[i].output);
          break;
        }

        testCases.testCases.forEach(async (testCase) => {
          // Pass test case
          if (
            testResults[i].input === testCase.input &&
            testResults[i].output === testCase.output &&
            testResults[i].runTime <= testCase.timeLimit
          ) {
            await Result.updateOne(
              {
                student: student,
                exercise: exercise,
                "testCases.input": testResults[i].input,
                "testCases.output": testResults[i].output,
              },
              {
                $set: {
                  "testCases.$.message": "Pass",
                  "testCases.$.actualOutput": testResults[i].output,
                  "testCases.$.runTime": testResults[i].runTime,
                  "testCases.$.pass": true,
                },
              }
            );
          }
          // Overtime test case
          else if (
            testResults[i].input === testCase.input &&
            testResults[i].output === testCase.output &&
            testResults[i].runTime > testCase.timeLimit
          ) {
            await Result.updateOne(
              {
                student: student,
                exercise: exercise,
                "testCases.input": testResults[i].input,
                "testCases.output": testResults[i].output,
              },
              {
                $set: {
                  "testCases.$.message": "Over Time",
                  "testCases.$.actualOutput": testResults[i].output,
                  "testCases.$.runTime": testResults[i].runTime,
                  "testCases.$.pass": false,
                },
              }
            );
          }

          // Fail test case
          else if (
            testResults[i].input === testCase.input &&
            testResults[i].output !== testCase.output
          ) {
            await Result.updateOne(
              {
                student: student,
                exercise: exercise,
                "testCases.input": testResults[i].input,
              },
              {
                $set: {
                  "testCases.$.message": "Fail",
                  "testCases.$.actualOutput": testResults[i].output,
                  "testCases.$.runTime": testResults[i].runTime,
                  "testCases.$.pass": false,
                },
              }
            );
          }
        });
        if (i === testResults.length - 1) next();
      }
    });
  }

  // Get all the output from sandbox
  getTestResults(processSubmit);

  async function processSubmit() {
    // The duration expired date and submit date
    const diff = new Date(exercise.expiredTime) - new Date(result.submitTime);
    if (diff < 0) {
      await Result.updateOne(
        { exercise: exercise, student: student },
        { isLate: true },
        { new: true }
      );
    } else {
      await Result.updateOne(
        { exercise: exercise, student: student },
        { isLate: false },
        { new: true }
      );
    }

    const finalResult = await Result.findOne({
      exercise: exercise,
      student: student,
    });

    finalResult.score = finalResult.getTotalPoint();
    await finalResult.save();

    const context = {
      point: finalResult.getTotalPoint(),
      testCases: finalResult.testCases,
    };

    res.status(200).send(context);
  }
});

export default router;
