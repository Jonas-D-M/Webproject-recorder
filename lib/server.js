"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("http");
const node_static_1 = require("node-static");
exports.default = (() => {
    let file = new node_static_1.Server(__dirname);
    let server;
    const startServer = (port = 3000, dirname = '.') => {
        server = (0, http_1.createServer)(function (req, res) {
            file.serve(req, res);
        }).listen(port);
        console.log(`Server is serving on port ${port}`);
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