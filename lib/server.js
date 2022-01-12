var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
define(["require", "exports", "connect", "serve-static"], function (require, exports, connect_1, serve_static_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    connect_1 = __importDefault(connect_1);
    serve_static_1 = __importDefault(serve_static_1);
    exports.default = (() => {
        const initServer = (port = 3000, dirname = '.') => {
            (0, connect_1.default)()
                .use((0, serve_static_1.default)(dirname))
                .listen(port, () => console.log(`Server running on ${port}`));
        };
        const test = () => {
            console.log('this is a message from the server.ts module');
            console.log('');
        };
        return {
            initServer,
            test,
        };
    })();
});
//# sourceMappingURL=server.js.map