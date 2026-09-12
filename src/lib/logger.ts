import { existsSync, mkdirSync } from 'fs';
import { Logger } from 'winston';
import *  as  winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
const logFormat = winston.format.combine(
	winston.format.colorize(),
	winston.format.timestamp(),
	winston.format.align(),
	winston.format.printf(d => `${d.timestamp} ${d.level}: ${d.message}`,
	));
const logDir = './logs';

if (!existsSync(logDir)) {
	mkdirSync(logDir);
}

const transport = new DailyRotateFile({
	filename: `${logDir}/combined.log`,
	datePattern: 'YYYY-MM-DD',
	zippedArchive: true,
	maxSize: '20m',
	maxFiles: '30d'
});

const logger: Logger = winston.createLogger({
	
	format: logFormat,
	transports: [transport, new winston.transports.Console({ level: "info", })]
});

export default logger;
