"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// const github = require("@actions/github");
const fs_1 = __importDefault(require("fs"));
// const readmeBox = require("readme-box").ReadmeBox;
// const chunk = require("chunk");
(() => __awaiter(void 0, void 0, void 0, function* () {
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
    fs_1.default.readdir(".", (err, files) => {
        files.forEach((file) => {
            console.log(file);
        });
    });
    // function logFile(err, data) {
    //   err
    //     ? Function("error", "throw error")(err)
    //     : console.log(JSON.stringify(data));
    // }
    function run() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("Hello world!");
        });
    }
    run();
}))();
//# sourceMappingURL=action.js.map