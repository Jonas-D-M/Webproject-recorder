"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const node_static_1 = __importDefault(require("node-static"));
exports.default = (() => {
    let server;
    const startServer = (port = 3000, dirname) => {
        const file = new node_static_1.default.Server(`${process.cwd()}${dirname}`);
        server = http_1.default
            .createServer(function (req, res) {
            file.serve(req, res);
        })
            .listen(port);
    };
    const stopServer = () => {
        console.log('Server is stopping');
        server.close();
    };
    const test = () => {
        console.log('this is a message from the server.ts module');
        console.log('');
        console.log('another one');
    };
    return {
        startServer,
        test,
        stopServer,
    };
})();
//# sourceMappingURL=server.js.map