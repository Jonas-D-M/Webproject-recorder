const io = require("@actions/io");

async function run() {
  console.log("Hello world!");
  await io.mkdirP("/helloworld");
}

run();
