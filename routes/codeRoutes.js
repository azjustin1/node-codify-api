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

  let result = await Result.findOne({
    student: student,
    exercise: exercise,
  });

  if (!result) {
    result = new Result({
      student: student,
      exercise: exercise,
      testCases: exercise.testCases,
      studentCode: req.body.code,
    });
    await result.save();
  }

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

  sandBox.run(async (testResults) => {
    let context = [];
    for (var i = 0; i < testResults.length; i++) {
      if (testResults[i].type === "error") {
        res.send(testResults[i].output);
        break;
      } else if (testResults[i].type === "success") {
        result.testCases.forEach(async (testCase, i) => {
          if (
            testCase.input === testResults[i].input &&
            testCase.output === testResults[i].output &&
            testCase.timeLimit >= testResults[i].runTime
          ) {
            await Result.update(
              {
                student: student,
                exercise: exercise,
                "testCases.input": testResults[i].input,
                "testCases.output": testResults[i].output,
              },
              {
                $set: {
                  "testCases.$.actualOutput": testResults[i].output,
                  "testCases.$.pass": true,
                  "testCases.$.message": "Correct",
                },
              }
            );
          }
          if (
            testCase.input === testResults[i].input &&
            testCase.output !== testResults[i].output &&
            testCase.timeLimit >= testResults[i].runTime
          ) {
            await Result.update(
              {
                student: student,
                exercise: exercise,
                "testCases.input": testResults[i].input,
              },
              {
                $set: {
                  "testCases.$.actualOutput": testResults[i].output,
                  "testCases.$.pass": false,
                  "testCases.$.message": "Incorrect",
                },
              }
            );
          }
          if (
            testCase.input === testResults[i].input &&
            testCase.timeLimit < testResults[i].runTime
          ) {
            await Result.update(
              {
                student: student,
                exercise: exercise,
                "testCases.input": testResults[i].input,
                "testCases.output": testResults[i].output,
              },
              {
                $set: {
                  "testCases.$.actualOutput": testResults[i].output,
                  "testCases.$.pass": false,
                  "testCases.$.message": "Over Time",
                },
              }
            );
          }
        });
      }

      if (i === testResults.length - 1) {
        const updateResult = await Result.findOne({
          student: student,
          exercise: exercise,
        });
        const result = {
          point: updateResult.getTotalPoint(),
          testCases: updateResult.testCases,
        };
        context.push(result);
        res.send(context);
      }
    }

    //   // Send to the client after check all test case
    //   if (i === testResults.length - 1) {
    //     console.log("End");
    //     const updateResult = await Result.findOne({
    //       student: student,
    //       exercise: exercise,
    //     });

    //     const result = {
    //       point: updateResult.getTotalPoint(),
    //       testCases: updateResult.testCases,
    //     };
    //     context.push(result);

    //     return res.send(context);
    //   }
    // });
  });
});

export default router;
