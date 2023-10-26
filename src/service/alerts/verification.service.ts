import { Alert, ApiAlert, SlackAlert, DiscordAlert } from "../../interfaces";
import { AlertTransports } from "../../enums";
import { colorize } from "../../utils";
import { webhookUrl } from "../../config/urls.config";
import axios from "axios";

class AlertVerification {
  private config: Alert;
  private webhookUrl: string = webhookUrl;
  constructor(config: Alert) {
    this.config = config;

    this.verify = this.verify.bind(this);
    this.verifyProject = this.verifyProject.bind(this);
    this.verifyTransport = this.verifyTransport.bind(this);
    this.verifyHttp = this.verifyHttp.bind(this);
    this.verifyDiscord = this.verifyDiscord.bind(this);
  }

  public verify(): void {
    this.verifyProject();
    this.verifyTransport();
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

  private verifyTransport(): void {
    const { transport } = this.config;
    if (!transport) {
      console.log(
        colorize.info("Alert transport is set to null, no alerts will be sent")
      );
      return;
    }

    if (!Object.values(AlertTransports).includes(transport)) {
      console.log(
        colorize.warn("Transport is not valid, no alerts will be sent")
      );
      return;
    }

    switch (transport) {
      case AlertTransports.HTTP:
        this.verifyHttp();
        break;
      case AlertTransports.DISCORD:
        this.verifyDiscord();
        break;
      case AlertTransports.SLACK:
        this.verifySlack();
        break;
      default:
        console.log(
          colorize.warn("Transport is not valid, no alerts will be sent")
        );
        break;
    }
  }

  private async verifyDiscord(): Promise<void> {
    const { discord } = this.config;
    if (!discord) {
      console.log(
        colorize.error(
          "Discord transport is not defined, no alerts will be sent"
        )
      );
      return;
    }

    const { channels } = discord!;
    if (!channels) {
      console.log(
        colorize.error(
          "Discord channels are not defined, no alerts will be sent"
        )
      );
      return;
    }

    // health check discord bot
    try {
      const res = await axios.get(`${this.webhookUrl}/discord/health`);
      if (res.status !== 200) {
        console.log(
          colorize.error("DIscord bot seems to be down, please try again later")
        );
        this.config.transport = null;
        return;
      }
    } catch (error) {
      console.log(
        colorize.error("DIscord bot seems to be down, please try again later")
      );
      this.config.transport = null;
      return;
    }
  }

  private async verifySlack(): Promise<void> {
    const { slack } = this.config;
    if (!slack) {
      console.log(
        colorize.error("Slack transport is not defined, no alerts will be sent")
      );
      this.config.transport = null;
      return;
    }

    const { channels } = slack!;
    if (!channels) {
      console.log(
        colorize.error("Slack channels are not defined, no alerts will be sent")
      );
      this.config.transport = null;
      return;
    }

    // health check slack bot
    try {
      const res = await axios.get(`${this.webhookUrl}/slack/health`);
      if (res.status !== 200) {
        console.log(
          colorize.error("Slack bot seems to be down, please try again later")
        );
        this.config.transport = null;
        return;
      }
    } catch (error) {
      console.log(error);
      console.log(
        colorize.error("Slack bot seems to be down, please try again later")
      );
      this.config.transport = null;
      return;
    }
  }

  private async verifyHttp(): Promise<void> {
    const { http } = this.config;
    if (!http) {
      console.log(
        colorize.error("Http transport is not defined, no alerts will be sent")
      );
      this.config.transport = null;
      return;
    }

    const { alertUrl, healthCheck, body } = http!;
    if (!alertUrl) {
      console.log(
        colorize.error("Http alertUrl is not defined, no alerts will be sent")
      );
      this.config.transport = null;
      return;
    }

    if (!healthCheck) {
      console.log(
        colorize.error(
          "Http healthCheck is not defined, your alerts might not be sent"
        )
      );
      return;
    } else {
      const config = {
        method: http.healthCheck?.method.toLowerCase(),
        url: `${http.alertUrl}/${http.healthCheck?.path}`,
      };
      try {
        const { data } = await axios(config);
        if (data.status !== 200) {
          console.log(
            colorize.error(
              "Http healthCheck failed, your alerts might not be sent"
            )
          );
          return;
        }
      } catch (error) {
        console.log(
          colorize.error(
            "Http healthCheck failed, your alerts might not be sent"
          )
        );
        return;
      }
    }

    if (!body) {
      console.log(
        colorize.info(
          "Your api will receive a default body, you can change this in the config"
        ),
        "[DEFAULT BODY]",
        {
          project: this.config.project,
          message: "This is a test message",
          level: "<log | info | warn | error>",
          env: this.config.environment,
          timestamp: new Date().toISOString(),
        }
      );
    }
  }
}

export default AlertVerification;
