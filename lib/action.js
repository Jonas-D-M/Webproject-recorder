"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@actions/core");
const puppeteer_1 = __importDefault(require("./puppeteer"));
const utils_1 = require("./utils");
(async () => {
    try {
        const { example } = puppeteer_1.default;
        const ffmpegPath = (0, core_1.getInput)('ffmpeg-path');
        example(ffmpegPath);
        (0, utils_1.searchDir)('./tmp', /\test.mp4$/, function (filename) {
            console.log('-- found: ', filename);
        });
    }
    catch (error) {
        console.log(error);
        (0, core_1.setFailed)(error.message);
    }
})();
//# sourceMappingURL=action.js.map