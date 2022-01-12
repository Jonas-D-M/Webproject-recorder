const core = require("@actions/core");
// const github = require("@actions/github");
// const fs = require("fs");
const path = require("path");
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

  async function run() {
    console.log("Hello world!");
    console.log(process.env);
    console.log(process.env.GITHUB_WORKSPACE);
  }

  run();
})();
