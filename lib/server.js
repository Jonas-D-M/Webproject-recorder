"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const connect_1 = __importDefault(require("connect"));
const serve_static_1 = __importDefault(require("serve-static"));
exports.default = (() => {
    const startServer = (port = 3000, dirname = '.') => {
        (0, connect_1.default)()
            .use((0, serve_static_1.default)(dirname))
            .listen(port, () => console.log(`Server running on ${port}`));
    };
    const stopServer = () => {
        console.log('Server is stopping');
        process.exit();
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