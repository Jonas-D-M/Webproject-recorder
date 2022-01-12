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
const puppeteer_1 = __importDefault(require("puppeteer"));
const puppeteer_screen_recorder_1 = require("puppeteer-screen-recorder");
(() => __awaiter(void 0, void 0, void 0, function* () {
    const browserConfig = {
        headless: false,
        args: ['--start-maximized'],
    };
    const recordConfig = {
        followNewTab: true,
        fps: 25,
        ffmpeg_Path: '/usr/bin/ffmpeg',
        videoFrame: {
            width: 1920,
            height: 1080,
        },
        aspectRatio: '16:9',
    };
    let processId;
    const browser = yield puppeteer_1.default.launch(browserConfig).then(browser => {
        var _a;
        processId = (_a = browser.process()) === null || _a === void 0 ? void 0 : _a.pid;
        return browser;
    });
    try {
        const width = 1920;
        const height = 1080;
        const url = 'https://github.com';
        const [page] = yield browser.pages();
        const recorder = new puppeteer_screen_recorder_1.PuppeteerScreenRecorder(page, recordConfig);
        const savePath = './tmp/test.mp4';
        yield page.setViewport({ width, height });
        yield recorder.start(savePath);
        yield page.goto(url);
        yield autoScroll(page);
        yield recorder.stop();
        yield browser.close();
    }
    catch (error) {
        browser.close();
    }
}))();
function autoScroll(page) {
    return __awaiter(this, void 0, void 0, function* () {
        yield page.evaluate(() => __awaiter(this, void 0, void 0, function* () {
            yield new Promise((resolve, reject) => {
                let totalHeight = 0;
                let distance = 100;
                let timer = setInterval(() => {
                    let scrollHeight = document.body.scrollHeight;
                    window.scrollBy(0, distance);
                    totalHeight += distance;
                    if (totalHeight >= scrollHeight) {
                        clearInterval(timer);
                        resolve();
                    }
                }, 200);
            });
        }));
    });
}
//# sourceMappingURL=puppeteerServer.js.map