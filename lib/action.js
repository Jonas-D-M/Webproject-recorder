"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = __importDefault(require("@actions/core"));
const puppeteer_1 = __importDefault(require("./puppeteer"));
const utils_1 = require("./utils");
(async () => {
    try {
        const { example } = puppeteer_1.default;
        const ffmpegPath = core_1.default.getInput('ffmpeg-path');
        example(ffmpegPath);
        (0, utils_1.searchDir)('./tmp', /\test.mp4$/, function (filename) {
            console.log('-- found: ', filename);
        });
    }
    catch (error) {
        console.log(error);
        core_1.default.setFailed(error);
    }
})();
//# sourceMappingURL=action.js.map