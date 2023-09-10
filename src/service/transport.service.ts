import path = require("path");
import {
  LoggerLevel,
  LoggerFileTypes,
  LoggerColors,
} from "../enums/logger_config.enum";
import * as fs from "fs";
import { colorize } from "../utils/colorize.utility";
import axios, { AxiosInstance, CreateAxiosDefaults } from "axios";
import { io, Socket } from "socket.io-client";
import {
  LoggerProject,
  LoggerSocketIO,
  LoggerHttp,
  LoggerFile,
} from "../interfaces/logger_config.interface";

class ConsoleTransportService {
  constructor(project: LoggerProject, originalConsole: Console) {
    this.project = project;
    this.originalConsole = originalConsole;
  }
  private project: LoggerProject;
  private originalConsole: Console;

  private getLevelColor(level: LoggerLevel): string {
    switch (level) {
      case LoggerLevel.DEBUG:
        return LoggerColors.WHITE;
      case LoggerLevel.INFO:
        return LoggerColors.BLUE;
      case LoggerLevel.WARN:
        return LoggerColors.YELLOW;
      case LoggerLevel.ERROR:
        return LoggerColors.RED;
      default:
        return LoggerColors.WHITE;
    }
  }

  private getTimestamp(level: LoggerLevel): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();

    switch (level) {
      case LoggerLevel.DEBUG:
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
      case LoggerLevel.INFO:
        return date.toDateString();
      case LoggerLevel.WARN:
        return `${hours}:${minutes}:${seconds}`;
      case LoggerLevel.ERROR:
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
      default:
        return date.toDateString();
    }
  }

  private getPrefix(level: LoggerLevel): string {
    switch (level) {
      case LoggerLevel.DEBUG:
        return `🐛 [${this.getTimestamp(level)} - ${this.project.name}:${
          this.project.version
        }]`;
      case LoggerLevel.INFO:
        return `ℹ️ [${this.getTimestamp(level)} - ${this.project.name}:${
          this.project.version
        }]`;
      case LoggerLevel.WARN:
        return `⚠️ [${this.getTimestamp(level)} - ${this.project.name}:${
          this.project.version
        }]`;
      case LoggerLevel.ERROR:
        return `❌ [${this.getTimestamp(level)} - ${this.project.name}:${
          this.project.version
        }]`;
      default:
        return `ℹ️ [${this.getTimestamp(level)} - ${this.project.name}:${
          this.project.version
        }]`;
    }
  }

  public log(level: LoggerLevel, ...args: any[]): void {
    const color = this.getLevelColor(level);
    const prefix = this.getPrefix(level);
    this.originalConsole.log(`${color}${prefix}${LoggerColors.RESET}`, ...args);
  }
}

class FileTransportService {
  constructor(config: LoggerFile, project: LoggerProject) {
    this.directory = config.directory;
    this.fileType = config.fileType;
    this.prefix = config.prefix!;
    this.project = project;
  }
  private directory: string;
  private fileType: LoggerFileTypes;
  private prefix: string;
  private project: LoggerProject;

  private getFileName(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    return `${this.prefix}_${year}-${month}-${day}.${this.fileType}`;
  }

  private getFilePath(level: LoggerLevel): string {
    const fileName = this.getFileName();
    if (!fs.existsSync(`${this.directory}/${level}`))
      fs.mkdirSync(`${this.directory}/${level}`);

    return path.resolve(this.directory, level, fileName);
  }

  private getPrefix(): string {
    const date = new Date();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();

    return `[${this.project.name}:${this.project.version}][${hours}:${minutes}:${seconds}]`;
  }

  private getMessage(...args: any[]): string {
    switch (this.fileType) {
      case LoggerFileTypes.JSON:
        return JSON.stringify(args);
      case LoggerFileTypes.LOG:
      case LoggerFileTypes.TXT:
        return args.join(" ");
      default:
        return args.join(" ");
    }
  }

  public log(level: LoggerLevel, ...args: any[]): void {
    const filePath = this.getFilePath(level);
    const prefix = this.getPrefix();
    const message = this.getMessage(...args);

    if (!fs.existsSync(filePath)) {
      switch (this.fileType) {
        case LoggerFileTypes.JSON:
          fs.writeFileSync(filePath, JSON.stringify([]));
          break;
        case LoggerFileTypes.LOG:
        case LoggerFileTypes.TXT:
          fs.writeFileSync(filePath, "");
          break;

        default:
          fs.writeFileSync(filePath, "");
          break;
      }
    }

    switch (this.fileType) {
      case LoggerFileTypes.JSON:
        const json = JSON.parse(fs.readFileSync(filePath, "utf-8"));
        json.push({
          prefix,
          message,
        });
        fs.writeFileSync(filePath, JSON.stringify(json));
        break;

      case LoggerFileTypes.LOG:
      case LoggerFileTypes.TXT:
        fs.appendFileSync(filePath, `${prefix} ${message}\n`);
        break;
      default:
        fs.appendFileSync(filePath, `${prefix} ${message}\n`);
        break;
    }
  }
}

class HttpTransportService {
  constructor(config: LoggerHttp, project: LoggerProject) {
    let axiosConfig: CreateAxiosDefaults = {
      baseURL: config.baseUrl,
    };
    if (config.headers) {
      axiosConfig.headers = config.headers;
    }
    this.axiosInstance = axios.create(axiosConfig);
    this.project = project;
  }

  private axiosInstance: AxiosInstance;
  private project: LoggerProject;

  private getMessages(...args: any[]): string {
    return args.reduce((acc, curr) => {
      if (typeof curr === "object") {
        return `${acc} ${JSON.stringify(curr)}`;
      } else {
        return `${acc} ${curr}`;
      }
    }, "");
  }

  public log(level: LoggerLevel, ...args: any[]): void {
    this.axiosInstance.post("/", {
      log: {
        level,
        message: this.getMessages(...args),
        timeStamp: new Date().toISOString(),
      },
      project: this.project,
    });
  }
}

class SocketIOTransportService {
  constructor(config: LoggerSocketIO, project: LoggerProject) {
    this.config = config;
    this.project = project;
    this.socket = this.connect();
  }
  private config: LoggerSocketIO;
  private project: LoggerProject;
  private socket: Socket;

  private connect(): Socket {
    const socket = io(this.config.baseUrl, {
      extraHeaders: this.config.headers,
    });
    socket.on("connect", () => {
      if (this.config.events.connection) {
        socket.emit(this.config.events.connection, {
          project: this.project,
          message: "Connected to socket.io server",
        });
      }
    });
    socket.on("disconnect", () => {
      console.log(colorize.yellow("Disconnected from socket.io server"));
    });

    socket.on("error", (error: Error) => {
      console.log(colorize.red(error.message));
      throw error;
    });

    return socket;
  }

  public log(level: LoggerLevel, ...args: any[]): void {
    this.socket.emit(this.config.events.log, {
      level,
      messages: args,
      timeStamp: new Date().toISOString(),
    });
  }
}

export {
  ConsoleTransportService,
  FileTransportService,
  HttpTransportService,
  SocketIOTransportService,
};
