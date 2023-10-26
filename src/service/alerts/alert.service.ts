import axios from "axios";
import moment = require("moment");
import { Alert } from "../../interfaces";
import { AlertLevels, AlertTransports } from "../../enums";
import { colorize } from "../../utils";
import AlertVerification from "./verification.service";
import { webhookUrl } from "../../config/urls.config";

class AlertService {
  private activeTransport: AlertTransports | null;
  private config: Alert;
  constructor(config: Alert) {
    new AlertVerification(config).verify();
    this.config = config;
    this.activeTransport = this.config.transport;

    this.httpTransport = this.httpTransport.bind(this);
    this.discordTransport = this.discordTransport.bind(this);
    this.slackTransport = this.slackTransport.bind(this);
  }

  public alert(
    type: AlertLevels,
    message: string,
    channel?: string,
    extraData?: any[]
  ): void {
    switch (this.activeTransport) {
      case AlertTransports.HTTP:
        this.httpTransport(type, message);
        break;
      case AlertTransports.DISCORD:
        this.discordTransport(type, message, channel!, extraData);
        break;
      case AlertTransports.SLACK:
        this.slackTransport(type, message, channel!, extraData);
        break;
      case null:
        break;
      default:
        break;
    }
    return;
  }

  private httpTransport(type: AlertLevels, message: string): void {
    let requestBody = {
      project: this.config.project,
      message,
      level: type,
      env: this.config.environment,
      timestamp: moment().format("YYYY-MM-DD HH:mm:ss"),
    };

    if (this.config.http!.body) {
      requestBody = this.config.http!.body(
        type,
        this.config.project,
        this.config.environment,
        message
      );
    }
    axios.post(this.config.http!.alertUrl, requestBody, {
      headers: {
        "Content-Type": "application/json",
        ...(this.config.http!.headers && this.config.http!.headers),
      },
    });
  }

  private discordTransport(
    type: AlertLevels,
    message: string,
    channel: string,
    embeds?: any[]
  ): void {
    const token = this.config.discord!.channels[channel];
    if (!token) {
      console.log(
        colorize.warn(`Channel ${channel} is not defined in discord config`)
      );
      return;
    }
    axios.post(`${webhookUrl}/discord/${token}`, {
      level: type,
      project: this.config.project,
      environment: this.config.environment,
      data: {
        text: message,
        ...(embeds && { embeds }),
      },
    });
  }

  private slackTransport(
    type: AlertLevels,
    message: string,
    channel: string,
    attachments?: any[]
  ): void {
    const token = this.config.slack!.channels[channel];
    if (!token) {
      console.log(
        colorize.warn(`Channel ${channel} is not defined in slack config`)
      );
      return;
    }
    axios.post(`${webhookUrl}/slack/${token}`, {
      level: type,
      project: this.config.project,
      environment: this.config.environment,
      data: {
        text: message,
        ...(attachments && { attachments }),
      },
    });
  }
}

export default AlertService;
