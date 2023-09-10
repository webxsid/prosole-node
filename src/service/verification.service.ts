import {
  LoggerConfig,
  LoggerRules,
  LoggerDiscord,
  LoggerFile,
  LoggerHttp,
  LoggerProject,
  LoggerSlack,
  LoggerStream,
  LoggerSocketIO,
} from "../interfaces/logger_config.interface";

import {
  LoggerLevel,
  LoggerTransport,
  LoggerFileTypes,
} from "../enums/logger_config.enum";
import path = require("path");
import * as fs from "fs";
import { colorize } from "../utils/colorize.utility";

type Env = "development" | "production";
class VerificationService {
  private verifyGeneralConfig(config: LoggerConfig): Env {
    const { envIdentifier } = config;
    if (!envIdentifier) throw new Error("envIdentifier is not set");
    const { key, development, production } = envIdentifier;
    const env = process.env[key];

    if (env === development) {
      return "development";
    } else if (env === production) {
      return "production";
    } else {
      throw new Error(
        `Environment variable ${key} is not set to ${development} or ${production}`
      );
    }
  }

  private verifyRules(rules: LoggerRules, env: Env, currentEnv: Env): void {
    const { transport, exitOnError } = rules;

    if (!transport) {
      if (env === currentEnv) {
        console.log(
          colorize.yellow(
            `No Transport is set for ${env}, all logs will be ignored`
          )
        );
      }
    } else {
      if (!Object.values(LoggerTransport).includes(transport)) {
        throw new Error(
          `${env}.transport is not set to one of the following: ${Object.values(
            LoggerTransport
          )}`
        );
      }
    }
  }

  private verifyProject(project: LoggerProject): LoggerProject {
    const { name, version } = project;
    if (!name) throw new Error("project.name is not set");
    if (!version) {
      console.log(
        colorize.yellow("project.version is not set, defaulting to 1.0.0")
      );
      project.version = "1.0.0";
    }
    return project;
  }

  private verifyDiscord(discord: LoggerDiscord): LoggerDiscord | undefined {
    const { webhookUrl, username } = discord;
    if (!webhookUrl || !username) {
      console.log(
        colorize.red("discord.webhookUrl or discord.username is not set"),
        colorize.yellow("Disabling discord transport")
      );
      return undefined;
    }
    return discord;
  }

  private verifyFile(file: LoggerFile): LoggerFile | undefined {
    const { directory, fileType, prefix } = file;
    if (!directory) {
      console.log(
        colorize.red("file.directory is not set"),
        colorize.yellow("Disabling file transport")
      );
      return undefined;
    } else {
      if (!fs.existsSync(directory)) {
        console.log(
          colorize.red("file.directory does not exist"),
          colorize.yellow("Disabling file transport")
        );
        return undefined;
      }

      if (!fs.lstatSync(directory).isDirectory()) {
        console.log(
          colorize.red("file.directory is not a directory"),
          colorize.yellow("Disabling file transport")
        );
        return undefined;
      }
      try {
        fs.accessSync(directory, fs.constants.R_OK);
      } catch (err) {
        console.log(
          colorize.red("file.directory is not readable"),
          colorize.yellow("Disabling file transport")
        );
        return undefined;
      }
    }
    if (!fileType || !Object.values(LoggerFileTypes).includes(fileType)) {
      console.log(
        colorize.yellow(
          `file.fileType is not set to one of the following: ${Object.values(
            LoggerFileTypes
          )} defaulting to ${LoggerFileTypes.LOG}
            `
        )
      );

      file.fileType = LoggerFileTypes.LOG;
    }

    if (!prefix) {
      file.prefix = "";
    } else {
      if (!prefix.length) {
        file.prefix = "";
      } else {
        if (prefix.length > 10) {
          console.log(colorize.yellow("file.prefix is too long, truncating"));
          file.prefix = prefix.slice(0, 10);
        }
        const regex = /[^a-zA-Z0-9_]/g;
        if (regex.test(prefix)) {
          console.log(
            colorize.yellow(
              "file.prefix contains invalid characters, replacing with _"
            )
          );
          file.prefix = prefix.replace(regex, "_");
        }
      }
    }
    return file;
  }

  private verifyHttp(http: LoggerHttp): LoggerHttp | undefined {
    const { baseUrl } = http;
    if (!baseUrl) {
      console.log(
        colorize.red("http.baseUrl is not set"),
        colorize.yellow("Disabling http transport")
      );
      return undefined;
    }

    return http;
  }

  private verifySocketIO(socketIO: LoggerSocketIO): LoggerSocketIO | undefined {
    const { baseUrl, events } = socketIO;
    if (!baseUrl || !events) {
      console.log(
        colorize.red("socketIO.baseUrl or socketIO.events is not set"),
        colorize.yellow("Disabling socketIO transport")
      );
      return undefined;
    }

    if (!events.log) {
      console.log(
        colorize.red("socketIO.events.log is not set"),
        colorize.yellow("Disabling socketIO transport")
      );
      return undefined;
    }

    return socketIO;
  }

  private verifySlack(slack: LoggerSlack): LoggerSlack | undefined {
    const { webhookUrl, channel, username, iconEmoji } = slack;
    if (!webhookUrl || !channel || !username || !iconEmoji) {
      console.log(
        colorize.red(
          "slack.webhookUrl, slack.channel, slack.username, or slack.iconEmoji is not set"
        ),
        colorize.yellow("Disabling slack transport")
      );
      return undefined;
    }
    return slack;
  }

  private verifyStream(stream: LoggerStream): LoggerStream | undefined {
    const { secretKey, projectId, logName } = stream;
    if (!secretKey || !projectId || !logName) {
      console.log(
        colorize.red(
          "stream.secretKey, stream.projectId, or stream.logName is not set"
        ),
        colorize.yellow("Disabling stream transport")
      );

      return undefined;
    }
    return stream;
  }

  private revertToConsole(config: LoggerConfig, env: Env): LoggerConfig {
    console.log(colorize.yellow(`Reverting ${env} to console transport`));
    config[env].transport = LoggerTransport.CONSOLE;
    return config;
  }

  public verifyConfig(config: LoggerConfig): {
    config: LoggerConfig;
    env: Env;
  } {
    const env = this.verifyGeneralConfig(config);

    for (const [key, value] of Object.entries(config)) {
      switch (key) {
        case "development":
        case "production":
          this.verifyRules(value, key, env);
          break;
        case "envIdentifier":
          break;
        case "project":
          config[key] = this.verifyProject(value);
          break;
        case "discord":
          config[key] = this.verifyDiscord(value);
          if (!config[key] && config[env].transport) {
            config = this.revertToConsole(config, env);
          }
          break;
        case "file":
          config[key] = this.verifyFile(value);
          if (!config[key] && config[env].transport) {
            config = this.revertToConsole(config, env);
          }
          break;
        case "http":
          config[key] = this.verifyHttp(value);
          if (!config[key] && config[env].transport) {
            config = this.revertToConsole(config, env);
          }
          break;
        case "slack":
          config[key] = this.verifySlack(value);
          if (!config[key] && config[env].transport) {
            config = this.revertToConsole(config, env);
          }
          break;
        case "stream":
          config[key] = this.verifyStream(value);
          if (!config[key] && config[env].transport) {
            config = this.revertToConsole(config, env);
          }
          break;
        default:
          throw new Error(`Unknown key: ${key}`);
      }
    }

    return { config, env };
  }
}

export const verificationService = new VerificationService();
