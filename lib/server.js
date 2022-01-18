"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pm2_1 = __importDefault(require("pm2"));
exports.default = (() => {
    const startPMServer = async (buildCMD, startCMD) => {
        const options = {
            script: `npm -- run ${startCMD}`,
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
                    pm2_1.default.start(options, (err, apps) => {
                        if (err) {
                            throw err;
                        }
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
    const startStaticPMServer = async () => {
        const options = {
            script: `serve`,
            name: 'site-server',
            max_restarts: 0,
            env: {
                PM2_SERVE_PATH: `.`,
                PM2_SERVE_PORT: '3000',
                PM2_SERVE_HOMEPAGE: './index.html',
            },
        };
        return new Promise((resolve, reject) => {
            try {
                pm2_1.default.connect(function (err) {
                    if (err) {
                        throw err;
                    }
                    pm2_1.default.start(options, (err, apps) => {
                        if (err) {
                            throw err;
                        }
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
    return {
        startPMServer,
        startStaticPMServer,
        stopPMServer,
    };
})();
//# sourceMappingURL=server.js.map