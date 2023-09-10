import * as env from "dotenv";
import {
  LoggerConfig,
  LoggerObject,
} from "../src/interfaces/logger_config.interface";
import { defaultConfig } from "../src/config/default.config";
import { verificationService } from "../src/service/verification.service";
import {
  ConsoleTransportService,
  FileTransportService,
  HttpTransportService,
  SocketIOTransportService,
} from "../src/service/transport.service";
import { LoggerLevel, LoggerTransport } from "../src/enums/logger_config.enum";
import { colorize } from "../src/utils/colorize.utility";
env.config();

class logger {
  private config: LoggerConfig;
  private env: "development" | "production";
  private originalConsole: Console;
  private transportService:
    | null
    | ConsoleTransportService
    | FileTransportService
    | HttpTransportService
    | SocketIOTransportService;

  constructor(userConfig?: LoggerConfig) {
    try {
      const { config, env } = verificationService.verifyConfig(
        userConfig ?? defaultConfig
      );
      this.config = config;
      this.env = env;
      // Initialize Transport Services
      this.originalConsole = console;
      switch (this.config[env].transport) {
        case LoggerTransport.CONSOLE:
          this.transportService = new ConsoleTransportService(
            this.config.project!,
            this.originalConsole
          );
          break;
        case LoggerTransport.FILE:
          this.transportService = new FileTransportService(
            this.config.file!,
            this.config.project
          );
          break;
        case LoggerTransport.HTTP:
          this.transportService = new HttpTransportService(
            this.config.http!,
            this.config.project
          );
          break;
        case LoggerTransport.SOCKET_IO:
          this.transportService = new SocketIOTransportService(
            this.config.socketIO!,
            this.config.project
          );
          break;
        default:
          this.transportService = null;
      }
      // Override Console
      this.overrideConsole();
    } catch (error: any) {
      console.log(colorize.red(error.message || error));
      process.exit(1);
    }
  }

  private overrideConsole() {
    console = {
      ...this.originalConsole,
      log: (...args: any[]) => {
        this.log(LoggerLevel.INFO, ...args);
      },
      info: (...args: any[]) => {
        this.log(LoggerLevel.INFO, ...args);
      },
      warn: (...args: any[]) => {
        this.log(LoggerLevel.WARN, ...args);
      },
      error: (...args: any[]) => {
        this.log(LoggerLevel.ERROR, ...args);
      },
      debug: (...args: any[]) => {
        this.log(LoggerLevel.DEBUG, ...args);
      },
    };
  }

  private log(level: LoggerLevel, ...args: any[]) {
    if (this.transportService) {
      this.transportService.log(level, ...args);
    }
  }
}

export { logger as Logger };
