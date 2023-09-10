import { LoggerConfig } from "../interfaces/logger_config.interface";
import { LoggerLevel, LoggerTransport } from "../enums/logger_config.enum";

const config: LoggerConfig = {
  development: {
    transport: LoggerTransport.CONSOLE,
    exitOnError: true,
  },
  production: {
    transport: null,
    exitOnError: false,
  },
  envIdentifier: {
    key: "NODE_ENV",
    development: "development",
    production: "production",
  },
  project: {
    name: "Logger",
    version: "1.0.0",
  },
};

export { config as defaultConfig };
