router.post("/run", (req, res, next) => {
  // Get code from the client and write to a file
  const fileName = "code.c";
  const writeCodeFile = fs.createWriteStream(fileName);
  writeCodeFile.write(req.body.code);
  writeCodeFile.end();
  // Get input from user test
  const input = "input.txt";
  const writeInputFile = fs.createWriteStream(input);
  writeInputFile.write(req.body.input);
  writeInputFile.end();
  // Build created code file and make it runnable
  const child = execFile(
    "gcc",
    [fileName, "-o", "code"],
    (error, stdout, stderr) => {
      // Send the compile error to user
      if (error) {
        console.log(stdout);
        res.status(501).send(stderr);
        // If compile success
      } else {
        // Run code.exe and send the result to the client
        const child = execFile(
          // This is code run for window server
          "cmd",
          ["/c", "code.exe<input.txt"],
          // If linux server use this "./code<input.txt"
          (error, stdout, stderr) => {
            if (error) {
              throw error;
            }
            // This is the result after run code
            const result = stdout;
            // Delete files have been created after send to the user
            try {
              fs.unlinkSync("./code.exe");
              fs.unlinkSync("./code.c");
              fs.unlinkSync("./input.txt");
              //file removed
            } catch (err) {
              console.error(err);
            }
            // Send the result to client
            res.status(200).send(result);
          }
        );
      }
    }
  );
});
