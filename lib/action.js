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
const firebase_1 = __importDefault(require("./firebase"));
(async () => {
    try {
        const { startPMServer, startStaticPMServer, stopPMServer } = server_1.default;
        const { recordLocalServer } = puppeteer_1.default;
        const { uploadFileToFirebase } = firebase_1.default;
        const env = process.argv[2] || 'dev';
        console.log('The process env: ', env);
        const ffmpegPath = env !== 'dev' ? core.getInput('ffmpeg-path') : '/usr/bin/ffmpeg';
        const chromePath = env !== 'dev'
            ? core.getInput('chrome-path')
            : '/usr/bin/google-chrome-stable';
        const projectDir = '.';
        core.startGroup('Searching package.json...');
        const hasPackageJson = (0, utils_1.findPackageJson)(projectDir);
        core.endGroup();
        if (hasPackageJson) {
            core.startGroup('Starting local server...');
            const { buildCMD, startCMD } = (0, utils_1.findNPMCommands)(`${projectDir}/package.json`);
            console.info('running commands');
            await startPMServer(buildCMD, startCMD);
            core.endGroup();
            console.info('starting server');
            const sitemap = [
                '/home',
                '/afdelingen',
                '/over-ons',
                '/ons-team',
                '/shop',
                '/nieuws',
            ];
            core.startGroup('Creating recording...');
            await recordLocalServer(ffmpegPath, chromePath, sitemap);
            core.endGroup();
        }
        else {
            core.notice('No package.json found, handling it as a regular HTML site');
            core.startGroup('Creating local server...');
            const sitemap = [
                '/index',
                '/vrijdag',
                '/zaterdag',
                '/info',
                '/reglement',
                '/sponsors',
                '/inschrijvingen',
                '/contact',
            ];
            console.info('starting static server');
            await startStaticPMServer();
            core.endGroup();
            core.startGroup('Creating recording...');
            await recordLocalServer(ffmpegPath, chromePath, sitemap, true);
            core.endGroup();
        }
        console.info('stopping server');
        await stopPMServer();
        core.startGroup('Uploading video to firebase...');
        const serviceAccount = require('../service-account.json');
        const bucket = process.env.BUCKET || '';
        const url = await uploadFileToFirebase(serviceAccount, bucket, './video/showcase-video.mp4', 'showcase-video');
        console.log(url);
        core.endGroup();
    }
    catch (error) {
        console.log('threw an error: ', error);
        core.setFailed(error);
    }
})();
//# sourceMappingURL=action.js.map