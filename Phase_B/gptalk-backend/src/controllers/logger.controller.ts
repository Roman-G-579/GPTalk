import { format, transports, createLogger } from 'winston';
import expressWinston from 'express-winston';
import 'winston-daily-rotate-file';

const FORMAT = format.combine(
	format.timestamp({ format: 'HH:mm:ss' }),
	format.splat(),
	format.errors({ stack: true }),
	format.printf((info) => {
		let { timestamp, level, message, stack, ...rest } = info;
		level = level.toUpperCase();
		let metadata = JSON.stringify(rest, undefined, 2);
		metadata = metadata === '{}' ? '' : `\n${metadata}`;
		const log = `[${timestamp}] ${level}: ${message.trim()} ${metadata}`;
		return stack ? `${log}\n${stack}` : log;
	}),
);

const fileTransport = new transports.DailyRotateFile({
	filename: 'logs/log-%DATE%.log',
	datePattern: 'DD-MM-YYYY',
	auditFile: 'logs/audit.json',
	maxSize: '20m',
	maxFiles: '30d',
	format: FORMAT,
});

export const expressLogger = expressWinston.logger({
	transports: [new transports.Console(), fileTransport],
	format: FORMAT,
	meta: false,
	metaField: null,
	expressFormat: true,
	colorize: false,
});

export const logger = createLogger({
	transports: [new transports.Console(), fileTransport],
	format: FORMAT,
});
