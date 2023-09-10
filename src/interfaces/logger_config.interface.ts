import {
  LoggerLevel,
  LoggerTransport,
  LoggerFileTypes,
} from "./../enums/logger_config.enum";

interface LoggerRules {
  transport: LoggerTransport | null;
  exitOnError: boolean;
}

interface LoggerProject {
  name: string;
  version?: string;
}

interface LoggerSlack {
  webhookUrl: string;
  channel: string;
  username: string;
  iconEmoji: string;
}

interface LoggerDiscord {
  webhookUrl: string;
  username: string;
}

interface LoggerStream {
  secretKey: string;
  projectId: string;
  logName: string;
}

interface LoggerFile {
  directory: string;
  fileType: LoggerFileTypes;
  prefix?: string;
}

interface LoggerHttp {
  baseUrl: string;
  headers?: {
    [key: string]: string;
  };
}

interface LoggerSocketIO {
  baseUrl: string;
  headers?: {
    [key: string]: string;
  };
  events: {
    connection?: string;
    disconnect?: string;
    log: string;
  };
}

interface LoggerConfig {
  development: LoggerRules;
  production: LoggerRules;
  envIdentifier: {
    key: string;
    development: string;
    production: string;
  };
  project: LoggerProject;
  slack?: LoggerSlack;
  discord?: LoggerDiscord;
  stream?: LoggerStream;
  http?: LoggerHttp;
  socketIO?: LoggerSocketIO;
  file?: LoggerFile;
}

interface LoggerObject {
  [key: string]: (...args: any[]) => void;
}

export {
  LoggerConfig,
  LoggerRules,
  LoggerProject,
  LoggerHttp,
  LoggerFile,
  LoggerStream,
  LoggerDiscord,
  LoggerSlack,
  LoggerObject,
  LoggerSocketIO,
};

// Path: src/interfaces/transport_config.interface.ts
