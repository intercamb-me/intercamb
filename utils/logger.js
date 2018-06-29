'use strict';

const settings = require('configs/settings');
const path = require('path');
const winston = require('winston');

const level = settings.debug ? 'debug' : 'info';
const printFormat = winston.format.printf(info => `${info.timestamp} - ${info.level}: ${info.message}`);

const consoleLogger = winston.createLogger({
  level,
  format: winston.format.timestamp(),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        printFormat,
      ),
    }),
  ],
});

const fileLogger = winston.createLogger({
  level,
  format: winston.format.timestamp(),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        printFormat,
      ),
    }),
    new winston.transports.File({
      filename: path.resolve('intercambio.log'),
      format: printFormat,
    }),
  ],
});

exports.file = fileLogger;
exports.console = consoleLogger;

exports.debug = fileLogger.debug;
exports.info = fileLogger.info;
exports.warn = fileLogger.warn;
exports.error = fileLogger.error;
