import { LogTransports, LogLevels } from "../enums";

interface Project {
  name: string;
  version?: string;
}

interface LogsStream {
  secretKey: string;
  projectId: string;
  logName: string;
}

interface LogsFile {
  directory: string;
  prefix?: string;
}

interface LogsSocketIO {
  baseUrl: string;
  headers?: {
    [key: string]: string;
  };
  events: {
    log: string;
  };
}

interface AlertDiscord {
  [channel: string]: string;
}

interface AlertSlack {
  [channel: string]: string;
}

interface Logger {
  project: Project;
  transport: LogTransports | null;
  baseLevel?: LogLevels;
  env: string;
  extendConsole?: boolean;
  file?: LogsFile;
  stream?: LogsStream;
  socketIO?: LogsSocketIO;
}

export { Logger, Project, LogsFile, LogsStream, LogsSocketIO };

// Path: src/interfaces/transport_config.interface.ts
