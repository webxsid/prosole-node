import axios from 'axios';
import moment from 'moment';
import { Alert } from '../../interfaces';
import { AlertLevels, AlertTransports } from '../../enums';
import { colorize } from '../../utils';
import AlertVerification from './verification.service';

class AlertService {
  private readonly activeTransport: string | null;
  private config: Alert;
  constructor(config: Alert) {
    new AlertVerification(config).verify();
    this.config = config;
    this.activeTransport = this.config.transport;

    this.httpTransport = this.httpTransport.bind(this);
    this.slackTransport = this.slackTransport.bind(this);
  }

  private getSlackColor(type: AlertLevels): string {
    switch (type) {
      case AlertLevels.INFO:
        return '#3498db';
      case AlertLevels.SUCCESS:
        return '#2ecc71';
      case AlertLevels.WARN:
        return '#f1c40f';
      case AlertLevels.ERROR:
        return '#e74c3c';
      default:
        return '#3498db';
    }
  }

  public alert(
    type: AlertLevels,
    message: string,
    channel?: string,
    extraData?: any[]
  ): void {
    switch (this.activeTransport as AlertTransports) {
      case AlertTransports.HTTP:
        this.httpTransport(type, message);
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
      timestamp: moment().format('YYYY-MM-DD HH:mm:ss'),
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
        'Content-Type': 'application/json',
        ...(this.config.http!.headers && this.config.http!.headers),
      },
    });
  }

  private slackTransport(
    type: AlertLevels,
    message: string,
    channel: string,
    attachments?: any[]
  ): void {
    const url = this.config.slack!.channels[channel];
    if (!url) {
      console.log(
        colorize.warn(`Channel ${channel} is not defined in slack config`)
      );
      return;
    }

    const color = this.getSlackColor(type);
    const requestBody = {
      username: 'Prosole Alerts',
      icon_url: 'https://i.imgur.com/ZhULocfs.png',
      text: `*[${type.toUpperCase()}]*\n${message}`,
      attachments: [
        {
          color,
          fields: [
            {
              title: 'Project',
              value: this.config.project.name,
              short: true,
            },
            {
              title: 'Version',
              value: this.config.project.version,
              short: true,
            },
            {
              title: 'Environment',
              value: this.config.environment,
              short: true,
            },
            {
              title: 'Timestamp',
              value: moment().format('YYYY-MM-DD HH:mm:ss'),
              short: true,
            },
          ],
        },
      ],
    };

    if (attachments) {
      requestBody.attachments.push(...attachments);
    }

    try {
      axios.post(url, requestBody, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (err) {
      console.log(
        colorize.error(
          `Error sending slack alert to ${channel}, please check your slack config`
        )
      );
      console.log(err);
    }

    return;
  }
}

export default AlertService;
