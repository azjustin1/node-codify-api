import { exec } from "child_process";
import fs from "fs";
import { stderr } from "process";

var sandBox = function (folder, code, inputs, outputs, language, compiler) {
  this.folder = folder;
  this.code = code;
  this.inputs = inputs;
  this.outputs = outputs;
  this.language = language;
  this.compiler = compiler;
};

sandBox.prototype.cleanFile = function () {
  const sandbox = this;

  if (
    fs.existsSync(
      __dirname +
        "/" +
        sandbox.folder +
        "/" +
        sandbox.code.codeFileName +
        "." +
        sandbox.language
    )
  )
    fs.unlinkSync(
      __dirname +
        "/" +
        sandbox.folder +
        "/" +
        sandbox.code.codeFileName +
        "." +
        sandbox.language
    );

  for (const [i, input] of sandbox.inputs.entries()) {
    if (
      fs.existsSync(
        __dirname + "/" + sandbox.folder + "/" + input.inputFileName + ".txt"
      )
    )
      fs.unlinkSync(
        __dirname + "/" + sandbox.folder + "/" + input.inputFileName + ".txt"
      );
    if (
      fs.existsSync(
        __dirname + "/" + sandbox.folder + "/" + sandbox.outputs[i] + i
      )
    ) {
      fs.unlinkSync(
        __dirname + "/" + sandbox.folder + "/" + sandbox.outputs[i] + i
      );
    }
  }
};

sandBox.prototype.run = function (success) {
  var sandbox = this;
  this.prepare(async function () {
    sandbox.execute(success);
  });
};

sandBox.prototype.prepare = function (success) {
  var sandbox = this;
  let directory = __dirname + "/" + sandbox.folder + "/";

  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }

  fs.mkdir(directory, { recursive: true }, function (err) {
    let writeCodeFile;
    let writeInputFile;

    writeCodeFile = fs.createWriteStream(
      directory + sandbox.code.codeFileName + "." + sandbox.language
    );
    writeCodeFile.write(sandbox.code.codeContent);
    writeCodeFile.end();

    for (const [i, input] of sandbox.inputs.entries()) {
      writeInputFile = fs.createWriteStream(
        directory + input.inputFileName + ".txt"
      );
      writeInputFile.write(input.inputContent);
      writeInputFile.end();
    }
  });
  success();
};

sandBox.prototype.execute = async function (success) {
  let outputs = [];
  const sandbox = this;

  for (const [i, input] of sandbox.inputs.entries()) {
    await exec(
      "sh " +
        __dirname +
        "/run-docker.sh " +
        __dirname +
        "/temp " +
        sandbox.compiler +
        " " +
        sandbox.code.codeFileName +
        "." +
        sandbox.language +
        " " +
        input.inputFileName +
        ".txt" +
        " " +
        sandbox.outputs[i] +
        i,
      async (err, stdout, stderr) => {
        // this.cleanFile();

        if (stderr) {
          await output.push(stderr.trim());
        }

        const result = stdout.trim().split("\n");

        const output = {
          input: input.inputContent,
          output: result[0],
          runTime: parseInt(result[1]),
        };
        await outputs.push(output);
        if (outputs.length === sandbox.inputs.length) {
          sandbox.cleanFile();
          success(outputs);
        }
      }
    );
  }
};

export default sandBox;
