/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 139:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {


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
Object.defineProperty(exports, "__esModule", ({ value: true }));
// const github = require("@actions/github");
const fs_1 = __importDefault(__nccwpck_require__(147));
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

/***/ }),

/***/ 147:
/***/ ((module) => {

module.exports = require("fs");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __nccwpck_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			__webpack_modules__[moduleId].call(module.exports, module, module.exports, __nccwpck_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete __webpack_module_cache__[moduleId];
/******/ 		}
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	if (typeof __nccwpck_require__ !== 'undefined') __nccwpck_require__.ab = __dirname + "/";
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __nccwpck_require__(139);
/******/ 	module.exports = __webpack_exports__;
/******/ 	
/******/ })()
;