import { Alert } from '../../interfaces';
import AlertService from './alert.service';
import { AlertLevels } from '../../enums';
import { colorize } from '../../utils';

class AlertClass {
  private instance: AlertService | null = null;
  private configured: boolean = false;
  constructor() {
    this.init = this.init.bind(this);
    this.sendToTransport = this.sendToTransport.bind(this);

    this.info = this.info.bind(this);
    this.warn = this.warn.bind(this);
    this.error = this.error.bind(this);
    this.success = this.success.bind(this);
    this.extendConsole = this.extendConsole.bind(this);
  }

  public init(config: Alert): void {
    if (this.configured) {
      console.log(colorize.warn('Alerts are already configured'));
      return;
    }
    this.instance = new AlertService(config);

    if (config.extendConsole) {
      this.extendConsole();
    }
    this.configured = true;
  }

  private sendToTransport(
    type: AlertLevels,
    message: string,
    channel?: string,
    extraData?: any[]
  ): void {
    if (!this.instance) {
      console.log(
        colorize.warn('Alerts are not configured, please call alerts.init()')
      );
      return;
    }
    return this.instance.alert(type, message, channel, extraData);
  }

  public info(message: string, channel?: string, extraData?: any[]) {
    this.sendToTransport(AlertLevels.INFO, message, channel, extraData);
  }
  public warn(message: string, channel?: string, extraData?: any[]) {
    this.sendToTransport(AlertLevels.WARN, message, channel, extraData);
  }
  public error(message: string, channel?: string, extraData?: any[]) {
    this.sendToTransport(AlertLevels.ERROR, message, channel, extraData);
  }
  public success(message: string, channel?: string, extraData?: any[]) {
    this.sendToTransport(AlertLevels.SUCCESS, message, channel, extraData);
  }

  private extendConsole(): void {
    console.alert = {
      info: this.info,
      warn: this.warn,
      error: this.error,
      success: this.success,
    };
  }
}

export default AlertClass;
