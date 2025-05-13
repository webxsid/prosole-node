import LoggerClass from '../src/service/logs';
import { LogLevels, LogTransports } from '../src/enums';

// tslint:disable-next-line:variable-name
const LoggerInstance = new LoggerClass();

const logger = {
  init: LoggerInstance.init,
  log: LoggerInstance.log,
  info: LoggerInstance.info,
  warn: LoggerInstance.warn,
  success: LoggerInstance.success,
  error: LoggerInstance.error,
};

const logLevels: {
  LOG: string;
  INFO: string;
  WARN: string;
  SUCCESS: string;
  ERROR: string;
} = {
  LOG: LogLevels.LOG,
  INFO: LogLevels.INFO,
  WARN: LogLevels.WARN,
  SUCCESS: LogLevels.SUCCESS,
  ERROR: LogLevels.ERROR,
};

const logTransports: {
  CONSOLE: string;
  FILE: string;
  SOCKETIO: string;
  STREAM: string;
} = {
  CONSOLE: LogTransports.CONSOLE,
  FILE: LogTransports.FILE,
  SOCKETIO: LogTransports.SOCKETIO,
  STREAM: LogTransports.STREAM,
};

export default logger;
export { logLevels, logTransports };
