import { Logger } from '../interfaces';
import { LogTransports } from '../enums';

const config: Logger = {
  transport: LogTransports.CONSOLE,
  env: 'development',
  extendConsole: false,
  project: {
    name: 'Logger',
    version: '1.0.0',
  },
};

export { config as defaultConfig };
