enum LogLevels {
  ERROR = 'error',
  SUCCESS = 'success',
  WARN = 'warn',
  INFO = 'info',
  LOG = 'log',
}

enum LogLevelWeights {
  LOG = 0,
  INFO = 1,
  SUCCESS = 2,
  WARN = 3,
  ERROR = 4,
}

enum LogTransports {
  CONSOLE = 'console',
  FILE = 'file',
  STREAM = 'stream',
  SOCKETIO = 'socketIO',
}

enum LogColors {
  error = '\x1b[31m',
  success = '\x1b[32m',
  warn = '\x1b[33m',
  info = '\x1b[34m',
  log = '\x1b[37m',
  reset = '\x1b[0m',
}

// tslint:disable-next-line:variable-name
const ValidTemplateVariables = [
    'timestamp',
    'metadata',
    'level'
];

export { LogLevels, LogTransports, LogColors, LogLevelWeights, ValidTemplateVariables };
