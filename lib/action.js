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
const timer_1 = __importDefault(require("./timer"));
const utils_1 = require("./utils");
exports.default = (async () => {
    const { screenshotComponents, addScreenshotsToReadme, createRecording } = puppeteer_1.default;
    const { startServer, stopServer } = server_1.default;
    const { startTimer, stopTimer, getDuration } = timer_1.default;
    try {
        await (0, utils_1.installDependencies)();
        const chromePath = await (0, utils_1.getChromePath)();
        const projectDir = process.cwd();
        core.startGroup('Searching package.json...');
        const isStatic = !(0, utils_1.findPackageJson)(projectDir);
        const wantsScreenshots = (0, utils_1.findComponentsJson)(projectDir);
        core.endGroup();
        console.log({ isStatic, wantsScreenshots });
        await startServer(isStatic, projectDir);
        await (0, utils_1.createShowcaseDirectories)(projectDir);
        startTimer();
        await createRecording(isStatic, chromePath);
        if (wantsScreenshots) {
            await screenshotComponents(chromePath, isStatic, projectDir);
            await addScreenshotsToReadme(projectDir);
        }
        stopTimer();
        console.log(`duration: ${getDuration()}s`);
        core.startGroup('Push changes to repo');
        await (0, utils_1.pushChanges)();
        core.endGroup();
        await stopServer(isStatic);
        process.exit(0);
    }
    catch (error) {
        console.log('threw an error: ', error);
        core.setFailed(error);
        process.exit(1);
    }
})();
//# sourceMappingURL=action.js.map