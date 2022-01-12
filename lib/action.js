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
define(["require", "exports", "@actions/core", "fs", "./server"], function (require, exports, core_1, fs_1, server_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    core_1 = __importDefault(core_1);
    fs_1 = __importDefault(fs_1);
    server_1 = __importDefault(server_1);
    // const readmeBox = require("readme-box").ReadmeBox;
    // const chunk = require("chunk");
    const { initServer, test } = server_1.default;
    (() => __awaiter(void 0, void 0, void 0, function* () {
        try {
            fs_1.default.readdir('.', (err, files) => {
                files.forEach(file => {
                    console.log(file);
                });
            });
            function run() {
                return __awaiter(this, void 0, void 0, function* () {
                    console.log('Hello world!');
                });
            }
            initServer();
            test();
            run();
        }
        catch (error) {
            core_1.default.setFailed(error.message);
        }
    }))();
});
//# sourceMappingURL=action.js.map