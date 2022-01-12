import core from "@actions/core";
// const github = require("@actions/github");
import fs from "fs";
import path from "path";

// const readmeBox = require("readme-box").ReadmeBox;
// const chunk = require("chunk");

(async () => {
  // const githubToken = core.getInput("github-token");
  // const filePath = path.join(
  //   process.env.GITHUB_WORKSPACE,
  //   core.getInput("json-file-path")
  // );

  // const columns = core.getInput("columns");
  // const data = fs.readFileSync(filePath, "utf8");
  // const json = JSON.parse(data);
  // const fileToUsePath = core.getInput("file-to-use");

  // fs.readFile("/github/workspace/README.md", logFile);

  fs.readdir(".", (err, files) => {
    files.forEach((file) => {
      console.log(file);
    });
  });

  // function logFile(err, data) {
  //   err
  //     ? Function("error", "throw error")(err)
  //     : console.log(JSON.stringify(data));
  // }

  async function run() {
    console.log("Hello world!");
  }

  run();
})();
