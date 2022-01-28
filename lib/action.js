"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const posix_1 = __importDefault(require("path/posix"));
const util_1 = require("util");
const octokit_1 = __importDefault(require("./octokit"));
const exec = (0, util_1.promisify)(require('child_process').exec);
const puppeteer_1 = __importDefault(require("./puppeteer"));
const server_1 = __importDefault(require("./server"));
const timer_1 = __importDefault(require("./timer"));
const utils_1 = require("./utils");
exports.default = (async () => {
    const { startPMServer, startStaticPMServer, stopPMServer } = server_1.default;
    const { recordLocalServer, getAllPages } = puppeteer_1.default;
    const { startTimer, stopTimer, getDuration } = timer_1.default;
    const { initOctokit, createCommit } = octokit_1.default;
    try {
        await exec('npm install pm2 -g');
        await exec('sudo pm2 update');
        await exec('pm2 install typescript');
        await exec('sudo apt install ffmpeg');
        const { stdout } = await exec('which google-chrome-stable');
        const chromePath = stdout.trim();
        const token = core.getInput('token');
        const dir = core.getInput('project-dir');
        const octokit = initOctokit(token);
        console.log('the cwd: ', process.cwd());
        const projectDir = posix_1.default.relative(process.cwd(), dir);
        console.info('Projectdir: ', projectDir);
        console.info('token: ', token);
        console.info('chromepath: ', chromePath);
        core.startGroup('Searching package.json...');
        const hasPackageJson = (0, utils_1.findPackageJson)(projectDir);
        core.endGroup();
        if (hasPackageJson) {
            startTimer();
            core.startGroup('Starting local server...');
            const { buildCMD, startCMD } = (0, utils_1.findNPMCommands)(`${projectDir}/package.json`);
            console.info('running commands');
            await startPMServer(buildCMD, startCMD);
            core.endGroup();
            console.info('starting server');
            const sitemap = await getAllPages(false, chromePath);
            console.log(sitemap);
            core.startGroup('Creating recording...');
            await recordLocalServer(chromePath, sitemap, false);
            core.endGroup();
        }
        else {
            startTimer();
            core.notice('No package.json found, handling it as a regular HTML site');
            core.startGroup('Creating local server...');
            console.info('starting static server');
            await startStaticPMServer(projectDir);
            const sitemap = await getAllPages(true, chromePath);
            core.endGroup();
            core.startGroup('Creating recording...');
            await recordLocalServer(chromePath, sitemap, true);
            core.endGroup();
        }
        console.info('stopping server');
        await stopPMServer();
        core.endGroup();
        stopTimer();
        console.log(`duration: ${getDuration()}s`);
        await createCommit(octokit);
        process.exit(0);
    }
    catch (error) {
        console.log('threw an error: ', error);
        await stopPMServer();
        core.setFailed(error);
        process.exit(1);
    }
})();
//# sourceMappingURL=action.js.map