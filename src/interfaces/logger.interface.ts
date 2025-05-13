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

interface TemplateArgs {
  timestamp: string;
  level: string;
  metadata: string;
}
type Template = string | ((args: TemplateArgs) => string);

interface Logger {
  project: Project;
  transport: string | null;
  baseLevel?: string;
  env: string;
  extendConsole?: boolean;
  file?: LogsFile;
  template?: Template | null;
  stream?: LogsStream;
  socketIO?: LogsSocketIO;
}

export { Logger, Project, LogsFile, LogsStream, LogsSocketIO };

// Path: src/interfaces/transport_config.interface.ts
