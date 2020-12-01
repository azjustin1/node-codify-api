import { exec } from "child_process";
import fs from "fs";
import { stderr } from "process";

var sandBox = function (path, folder, code, language) {
  this.path = path;
  this.folder = folder;
  this.code = code;
  this.language = language;
};

sandBox.prototype.run = function (success) {
  var sandbox = this;
  this.prepare(function () {
    sandbox.execute(success);
  });
};

sandBox.prototype.prepare = function (success) {
  success();
};

sandBox.prototype.execute = function (success) {
  console.log(__dirname);
  // exec("./a.sh " + __dirname, (err, stdout, stderr) => {
  //   console.log(err);
  //   console.log(stdout);
  //   // success(null, { message: stdout.replace(/\r?\n|\r/g, "") });
  // });
};

export default sandBox;
