"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const node_static_1 = __importDefault(require("node-static"));
const utils_1 = require("./utils");
const util_1 = require("util");
const child_process_1 = require("child_process");
const exec = (0, util_1.promisify)(child_process_1.exec);
exports.default = (() => {
    let server;
    const startNodeServer = (buildCMD, startCMD, dirname) => {
        return new Promise(async (resolve, reject) => {
            try {
                console.info('Starting node server in background');
                process.chdir(dirname);
                console.info('Installing dependencies first...');
                await exec('npm ci');
                (0, child_process_1.spawn)('npm', ['run', 'start'], {
                    stdio: 'ignore',
                    detached: true,
                }).unref();
                resolve();
            }
            catch (err) {
                reject(err);
            }
        });
    };
    const stopNodeServer = () => {
        return new Promise(async (resolve, reject) => {
            try {
                console.info('Stopping node server...');
                await exec('fuser -k 3000/tcp');
                resolve();
            }
            catch (error) {
                reject(error);
            }
        });
    };
    const startStaticServer = (dirname, port = 3000) => {
        return new Promise((resolve, reject) => {
            const file = new node_static_1.default.Server(dirname);
            server = http_1.default
                .createServer(function (req, res) {
                file.serve(req, res);
            })
                .listen(port);
            resolve();
        });
    };
    const stopStaticServer = () => {
        console.log('Server is stopping');
        server.close();
    };
    const startServer = async (isStatic, projectDir) => {
        console.info('Server is starting');
        if (isStatic) {
            await startStaticServer(projectDir);
        }
        else {
            const { buildCMD, startCMD } = (0, utils_1.findNPMCommands)(`${projectDir}/package.json`);
            await startNodeServer(buildCMD, startCMD, projectDir);
        }
    };
    const stopServer = async (isStatic) => {
        if (isStatic) {
            stopStaticServer();
        }
        else {
            await stopNodeServer();
        }
    };
    return {
        startServer,
        stopServer,
    };
})();
//# sourceMappingURL=server.js.map