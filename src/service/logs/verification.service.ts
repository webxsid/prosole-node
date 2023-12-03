//? node imports
import * as fs from "fs";
//? custom imports
import {
  Logger,
  LogsFile,
  LogsSocketIO,
  LogsStream,
  Project,
} from "../../interfaces";
import { LogTransports, LogLevelWeights, LogLevels } from "../../enums";
import { colorize } from "../../utils";
import { io, Socket } from "socket.io-client";

class LogVerification {
  private config: Logger;
  constructor(config: Logger) {
    this.config = config;

    this.verify = this.verify.bind(this);
    this.verifyProject = this.verifyProject.bind(this);
    this.verifyTransport = this.verifyTransport.bind(this);
    this.verifyFile = this.verifyFile.bind(this);
    this.verifyStream = this.verifyStream.bind(this);
    this.verifySocketIO = this.verifySocketIO.bind(this);
    this.verifyBaseLevel = this.verifyBaseLevel.bind(this);
  }

  public verify(): void {
    this.verifyProject();
    this.verifyTransport();
    this.verifyBaseLevel();
  }

  private verifyTransport(): void {
    const { transport } = this.config;
    if (!transport) {
      console.log(
        colorize.info(
          "Transport is not defined or null, nothing will be logged"
        )
      );
      this.config.transport = null;
      return;
    }
    if (!Object.values(LogTransports).includes(transport as LogTransports)) {
      console.log(
        colorize.warn(
          `Transport ${transport} is not valid, defaulting back to console`
        )
      );
      this.revertToConsole();
      return;
    }
    if (transport === LogTransports.FILE) {
      this.verifyFile();
    }
    if (transport === LogTransports.STREAM) {
      console.log(
        colorize.warn(
          "Stream transport is not supported yet, defaulting back to console"
        )
      );
      this.revertToConsole();
      return;
      // this.verifyStream();
    }
    if (transport === LogTransports.SOCKETIO) {
      this.verifySocketIO();
    }
  }

  private revertToConsole(): void {
    this.config.transport = LogTransports.CONSOLE;
    this.config.file = undefined;
    this.config.stream = undefined;
  }

  private isDirectoryValid(directory: string): boolean {
    try {
      if (!fs.existsSync(directory)) {
        console.log(colorize.error(`Directory ${directory} does not exist`));
        return false;
      }
      if (!fs.lstatSync(directory).isDirectory()) {
        console.log(colorize.error(`${directory} is not a directory`));
        return false;
      }
      fs.accessSync(directory, fs.constants.W_OK);
      return true;
    } catch (error) {
      console.log(colorize.error(`Directory ${directory} is not writable`));
      return false;
    }
  }

  private verifyProject(): void {
    const { project } = this.config;
    if (!project) {
      throw new Error("Project is required");
    }
    if (!project.name) {
      throw new Error("Project name is required");
    }
    if (!project.version) {
      console.log(
        colorize.warn("Project version is not defined, defaulting to 1.0.0")
      );
      this.config.project.version = "1.0.0";
    }
  }

  private verifyBaseLevel(): void {
    const { baseLevel } = this.config;
    if (!baseLevel) {
      console.log(
        colorize.warn("Base level is not defined, all logs will be logged")
      );
      this.config.baseLevel = LogLevels.LOG;
      return;
    }
    if (!Object.values(LogLevels).includes(baseLevel as LogLevels)) {
      console.log(
        colorize.warn(`Base level ${baseLevel} is not valid, defaulting to LOG`)
      );
      this.config.baseLevel = LogLevels.LOG;
      return;
    }
    const baseLevelInt = parseInt(LogLevelWeights[baseLevel as any]);
    if (baseLevelInt < LogLevelWeights.LOG) {
      console.log(
        colorize.warn(`Base level ${baseLevel} is not valid, defaulting to LOG`)
      );
      this.config.baseLevel = LogLevels.LOG;
      return;
    }

    if (baseLevelInt > LogLevelWeights.ERROR) {
      console.log(
        colorize.warn(
          `Base level ${baseLevel} is not valid, defaulting to ERROR`
        )
      );
      this.config.baseLevel = LogLevels.ERROR;
      return;
    }

    console.log(
      colorize.info(
        `Base level is ${baseLevel}, logs will be logged from ${baseLevel} and above`
      )
    );
  }

  private verifyFile(): void {
    const { file } = this.config;
    if (!file) {
      console.log(
        colorize.warn(
          "File transport is not defined, defaulting back to console"
        )
      );
      this.revertToConsole();
      return;
    }

    const { directory } = file!;
    if (!directory) {
      console.log(
        colorize.warn(
          "File directory is not defined, defaulting back to console"
        )
      );
      this.revertToConsole();
      return;
    }
    if (!this.isDirectoryValid(directory)) {
      console.log(colorize.warn("Defaulting back to console"));
      this.revertToConsole();
      return;
    }
  }

  private verifyStream(): void {
    const { stream } = this.config;
    if (!stream) {
      console.log(
        colorize.warn(
          "Stream transport is not defined, defaulting back to console"
        )
      );
      this.revertToConsole();
      return;
    }
    const { projectId, secretKey } = stream!;
    if (!projectId) {
      console.log(
        colorize.warn(
          "Stream projectId is not defined, defaulting back to console"
        )
      );
      this.revertToConsole();
      return;
    }

    if (!secretKey) {
      console.log(
        colorize.warn(
          "Stream secretKey is not defined, defaulting back to console"
        )
      );
      this.revertToConsole();
      return;
    }
  }

  private verifySocketIO(): void {
    const { socketIO } = this.config;
    if (!socketIO) {
      console.log(
        colorize.warn(
          "SocketIO transport is not defined, defaulting back to console"
        )
      );
      this.revertToConsole();
      return;
    }
    const { baseUrl, events } = socketIO!;
    if (!baseUrl) {
      console.log(
        colorize.warn(
          "SocketIO baseUrl is not defined, defaulting back to console"
        )
      );
      this.revertToConsole();
      return;
    }
    if (!events) {
      console.log(
        colorize.warn(
          "SocketIO events are not defined, events will be emitted on the default log event - log"
        )
      );
      this.config.socketIO!.events = {
        log: "log",
      };
      return;
    }
    if (!events.log) {
      console.log(
        colorize.warn(
          "SocketIO log event is not defined, events will be emitted on the default log event - log"
        )
      );
      this.config.socketIO!.events.log = "log";
      return;
    }
  }
}

export default LogVerification;
