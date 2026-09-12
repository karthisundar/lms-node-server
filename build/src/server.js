"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const environment_1 = __importDefault(require("./environments/environment"));
const global_1 = require("./global");
const env = new environment_1.default();
(0, global_1.setGlobalEnvironment)(env);
const App_1 = __importDefault(require("./App"));
const logger_1 = __importDefault(require("./lib/logger"));
const init_1 = __importDefault(require("./db/init"));
(0, init_1.default)();
const app = new App_1.default();
let server;
function serverError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }
    throw error;
}
function serverListening() {
    const addressInfo = server.address();
    logger_1.default.info(`Listening on ${addressInfo.address}:${env.port}`);
}
app.init()
    .then(() => {
    app.express.set('port', env.port);
    server = app.httpServer;
    server.on('error', serverError);
    server.on('listening', serverListening);
    server.listen(env.port);
}).catch((err) => {
    logger_1.default.info('app.init error');
    logger_1.default.error(err.name);
    logger_1.default.error(err.message);
    logger_1.default.error(err.stack);
});
process.on('unhandledRejection', (reason) => {
    logger_1.default.error('Unhandled Promise Error: reason:', reason.message);
    logger_1.default.error(reason.stack);
});
//# sourceMappingURL=server.js.map