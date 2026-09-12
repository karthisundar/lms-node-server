import Environment from './environments/environment';
import { setGlobalEnvironment } from './global';
const env: Environment = new Environment();
setGlobalEnvironment(env);
import * as http from 'http';
import { AddressInfo } from 'net';
import App from './App';
import logger from './lib/logger';
import dbInit from './db/init';


dbInit();
const app: App = new App();
let server: http.Server;

function serverError(error: NodeJS.ErrnoException): void {
    if (error.syscall !== 'listen') {
        throw error;
    }

    throw error;
}

function serverListening(): void {
    const addressInfo: AddressInfo = <AddressInfo>server.address();
    logger.info(`Listening on ${addressInfo.address}:${env.port}`);
}


app.init()
    .then(() => {
        app.express.set('port', env.port);
        server = app.httpServer;
        server.on('error', serverError);
        server.on('listening', serverListening);
        server.listen(env.port);
    }).catch((err: Error) => {
        logger.info('app.init error');
        logger.error(err.name);
        logger.error(err.message);
        logger.error(err.stack);
    });

process.on('unhandledRejection', (reason: Error) => {
    logger.error('Unhandled Promise Error: reason:', reason.message);
    logger.error(reason.stack);
});