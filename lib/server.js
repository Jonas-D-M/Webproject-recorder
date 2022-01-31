"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pm2_1 = __importDefault(require("pm2"));
const http_1 = __importDefault(require("http"));
const node_static_1 = __importDefault(require("node-static"));
const utils_1 = require("./utils");
exports.default = (() => {
    const startPMServer = async (buildCMD, startCMD) => {
        const options = {
            script: `npm -- run start`,
            name: 'site-server',
            max_restarts: 0,
            node_args: '--no-autorestart',
        };
        return new Promise((resolve, reject) => {
            try {
                pm2_1.default.connect(function (err) {
                    if (err) {
                        throw err;
                    }
                    console.log('connected to pm2');
                    pm2_1.default.start(options, (err, apps) => {
                        if (err) {
                            throw err;
                        }
                        console.log('started server');
                        pm2_1.default.disconnect();
                        resolve();
                    });
                });
            }
            catch (error) {
                console.log('threw an error: ', error);
                reject();
            }
        });
    };
    const startStaticPMServer = async (projectDir) => {
        const options = {
            script: `serve`,
            name: 'site-server',
            max_restarts: 0,
            env: {
                PM2_SERVE_PATH: `${projectDir}`,
                PM2_SERVE_PORT: 3000,
                PM2_SERVE_HOMEPAGE: './index.html',
            },
        };
        console.info(options);
        return new Promise((resolve, reject) => {
            try {
                pm2_1.default.connect(function (err) {
                    if (err) {
                        console.log('cant connect to pm2');
                        throw err;
                    }
                    console.log('connected to pm2');
                    pm2_1.default.start(options, (err, apps) => {
                        if (err) {
                            throw err;
                        }
                        console.log('started pm2');
                        pm2_1.default.disconnect();
                        resolve();
                    });
                });
            }
            catch (error) {
                console.log('threw an error: ', error);
                reject();
            }
        });
    };
    const stopPMServer = () => {
        return new Promise((resolve, reject) => {
            try {
                pm2_1.default.delete('site-server', (err, proc) => {
                    if (err) {
                        console.log(err);
                        process.exit(2);
                    }
                    resolve();
                });
            }
            catch (error) {
                pm2_1.default.disconnect();
                reject();
            }
        });
    };
    let server;
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
            await startPMServer(buildCMD, startCMD);
        }
    };
    const stopServer = async (isStatic) => {
        if (isStatic) {
            stopStaticServer();
        }
        else {
            await stopPMServer();
        }
    };
    return {
        startServer,
        stopServer,
    };
})();
//# sourceMappingURL=server.js.map