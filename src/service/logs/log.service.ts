import * as path from "path";
import * as fs from "fs";
import moment from "moment";
import { io, Socket } from "socket.io-client";
import {
  LogColors,
  LogLevels,
  LogTransports,
  LogLevelWeights,
} from "../../enums";
import { colorize } from "../../utils";
import {
  Project,
  LogsFile,
  LogsSocketIO,
  LogsStream,
  Logger,
} from "../../interfaces";
import LogVerification from "./verification.service";

class LoggerService {
  private activeTransport: LogTransports | null = null;
  private config: Logger;
  private socketIO?: Socket | null = null;
  constructor(config: Logger) {
    new LogVerification(config).verify();
    this.config = config;
    this.activeTransport = this.config.transport;

    this.log = this.log.bind(this);
    this.consoleTransport = this.consoleTransport.bind(this);
    this.fileTransport = this.fileTransport.bind(this);
    this.streamTransport = this.streamTransport.bind(this);
    this.socketIOTransport = this.socketIOTransport.bind(this);
    this.revertToConsole = this.revertToConsole.bind(this);
    this.setupStream = this.setupStream.bind(this);
    this.setupSocketIO = this.setupSocketIO.bind(this);
  }

  public log(level: LogLevels, ...args: any[]): void {
    if (
      this.config?.baseLevel &&
      LogLevelWeights[level.toUpperCase() as any] <
        LogLevelWeights[this.config.baseLevel.toUpperCase() as any]
    ) {
      return;
    }
    switch (this.activeTransport) {
      case LogTransports.CONSOLE:
        this.consoleTransport(level, ...args);
        break;
      case LogTransports.FILE:
        this.fileTransport(level, ...args);
        break;
      case LogTransports.STREAM:
        this.streamTransport(level, ...args);
        break;
      case LogTransports.SOCKETIO:
        this.socketIOTransport(level, ...args);
        break;
      case null:
        break;
      default:
        break;
    }
    return;
  }

  private revertToConsole(): void {
    this.activeTransport = LogTransports.CONSOLE;
  }

  private async setupStream(): Promise<Socket> {
    const { stream } = this.config;
    const socket = await io("http://localhost:3000", {
      extraHeaders: {
        projectId: stream!.projectId!,
        key: stream!.secretKey!,
      },
    });
    console.log(colorize.info("Connecting to stream"));
    socket.on("connect", () => {
      console.log(colorize.success("Connected to stream"));
    });
    socket.on("disconnect", () => {
      console.log(colorize.warn("Disconnected from stream"));
    });
    socket.on("error", (error) => {
      console.log(colorize.error("Something went wrong with the stream"));
      console.log(colorize.error(error));
      console.log(colorize.warn("Reverting to console transport"));
      this.revertToConsole();
    });
    return socket;
  }

  private async setupSocketIO(): Promise<Socket> {
    const { socketIO } = this.config;
    const socket = io(socketIO!.baseUrl, {
      extraHeaders: socketIO!.headers,
    });
    socket.on("connect", () => {
      console.log(colorize.success("Connected to socketIO"));
    });
    socket.on("disconnect", () => {
      console.log(colorize.warn("Disconnected from socketIO"));
    });
    socket.on("error", (error) => {
      console.log(colorize.error("Something went wrong with socketIO"));
      console.log(colorize.error(error));
      console.log(colorize.warn("Reverting to console transport"));
      this.revertToConsole();
    });

    return socket;
  }

  private async consoleTransport(
    level: LogLevels,
    ...args: any[]
  ): Promise<void> {
    // timestamp for log yyyy-mm-dd hh:mm
    const timestamp = moment().format("YYYY-MM-DD HH:mm");
    const project = `${this.config.project!.name}:${
      this.config.project!.version
    }`;
    // colorize the level
    const colorizedLevel = colorize[level](
      `[${project} | ${timestamp} | ${level.toUpperCase()}]`
    );

    // log to console
    console.log(colorizedLevel, ...args);
  }

  private async fileTransport(level: LogLevels, ...args: any[]): Promise<void> {
    // timestamp for log hh:mm:ss
    const timestamp = moment().format("HH:mm:ss");
    const date = moment().format("YYYY-MM-DD");

    const project = `${this.config.project!.name}: v${
      this.config.project!.version
    }`;

    // log to file
    const filePath = path.join(
      this.config.file!.directory,
      `${this.config.file!.prefix || ""}_${date}.log`
    );

    // create file if it doesn't exist
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, "");
    }

    // append to file
    fs.appendFileSync(
      filePath,
      `${timestamp} | [${project} - ${level.toUpperCase()}] -> ${args
        .map((arg) => (typeof arg === "object" ? JSON.stringify(arg) : arg))
        .join(" ")}\n`
    );
  }

  private async streamTransport(
    level: LogLevels,
    ...args: any[]
  ): Promise<void> {
    if (!this.socketIO) {
      this.socketIO = await this.setupStream();
    }
    this.socketIO!.emit(
      "addLog",
      {
        level: level.toUpperCase(),
        data: args,
      },
      (response: any) => {
        if (response.error) {
          console.log(colorize.error(response.error));
          console.log(colorize.warn("Reverting to console transport"));
          this.revertToConsole();
        }
      }
    );
    return;
  }

  private async socketIOTransport(
    level: LogLevels,
    ...args: any[]
  ): Promise<void> {
    if (!this.socketIO) {
      this.socketIO = await this.setupSocketIO();
    }
    this.socketIO!.emit(
      this.config.socketIO!.events.log,
      {
        level: level.toUpperCase(),
        data: args,
      },
      (response: any) => {
        if (response.error) {
          console.log(colorize.error(response.error));
          console.log(colorize.warn("Reverting to console transport"));
          this.revertToConsole();
        }
      }
    );
    return;
  }
}

export default LoggerService;
