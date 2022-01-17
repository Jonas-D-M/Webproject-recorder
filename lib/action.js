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
const puppeteer_1 = __importDefault(require("./puppeteer"));
const server_1 = __importDefault(require("./server"));
const utils_1 = require("./utils");
(async () => {
    try {
        const { startServer, stopServer, test } = server_1.default;
        const { example, recordLocalServer } = puppeteer_1.default;
        const env = process.argv[2] || 'dev';
        console.log('The process env: ', env);
        const ffmpegPath = env !== 'dev' ? core.getInput('ffmpeg-path') : '/usr/bin/ffmpeg';
        const chromePath = env !== 'dev'
            ? core.getInput('chrome-path')
            : '/usr/bin/google-chrome-stable';
        const projectDir = 'test2';
        const hasPackageJson = (0, utils_1.findPackageJson)(projectDir);
        if (hasPackageJson) {
            const { buildCMD, startCMD } = (0, utils_1.findNPMCommands)(`${projectDir}/package.json`);
            console.log('running commands');
            await (0, utils_1.runCommands)(buildCMD, startCMD);
            console.log('starting server');
            await recordLocalServer(ffmpegPath, chromePath);
            console.log('stopping server');
            await (0, utils_1.stopPMServer)();
        }
        else {
            startServer(3000, '/test');
            await recordLocalServer(ffmpegPath, chromePath);
            stopServer();
        }
    }
    catch (error) {
        console.log(error);
        core.setFailed(error);
    }
})();
//# sourceMappingURL=action.js.map