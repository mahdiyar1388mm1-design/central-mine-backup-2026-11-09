import { LoggerOptions, addColors } from 'winston';
import * as winston from 'winston';
import { utilities as nestWinstonModuleUtilities } from 'nest-winston';

const SECRET_KEYS = [
  /passw(or)?d/i,
  /^pw$/,
  /^pass$/i,
  /secret/i,
  /token/i,
  /api[-._]?key/i,
  /session[-._]?id/i,
  /^connect\.sid$/,
];

function redact(info: any) {
  for (const key of Object.keys(info || {})) {
    if (SECRET_KEYS.some((regex) => regex.test(key))) {
      info[key] = '************';
    }
  }
  return info;
}

function defaultFormat() {
  return winston.format.combine(
    winston.format(redact)(),
    winston.format.timestamp(),
    winston.format.ms(),
    nestWinstonModuleUtilities.format.nestLike(),
  );
}

function stagingFormat() {
  return winston.format.combine(defaultFormat(), winston.format.colorize());
}

function productionFormat() {
  return winston.format.combine(defaultFormat());
}

addColors({
  error: 'bold green redBG',
  warn: 'italic black yellowBG',
  info: 'cyan',
  http: 'grey',
  verbose: 'magenta',
  debug: 'green',
  silly: 'bold gray magentaBG',
});

export function winstonConsole(logLevel = 'debug'): LoggerOptions {
  return {
    format:
      process.env.NODE_ENV === 'production'
        ? productionFormat()
        : stagingFormat(),
    transports: [
      new winston.transports.Console({
        format: stagingFormat(),
        level: logLevel,
      }),
    ],
    exitOnError: false,
  };
}
