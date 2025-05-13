import { Logger } from '../../interfaces';
import LoggerService from '../../service/logs/log.service';
import { LogLevels } from '../../enums';
import { colorize } from '../../utils';

class LoggerClass {
  private instance: LoggerService | null = null;
  private configured: boolean = false;
  constructor() {
    this.init = this.init.bind(this);
    this.log = this.log.bind(this);
    this.info = this.info.bind(this);
    this.warn = this.warn.bind(this);
    this.success = this.success.bind(this);
    this.error = this.error.bind(this);
    this.extendConsole = this.extendConsole.bind(this);
  }

  public init(config: Logger): void {
    if (this.configured) {
      console.log(colorize.warn('Logger is already configured'));
      return;
    }
    this.instance = new LoggerService(config);

    if (config.extendConsole) {
      this.extendConsole();
    }
    this.configured = true;
  }

  private sendToTransport(level: LogLevels, ...args: any[]): void {
    if (!this.instance) {
      console.log(
        colorize.warn('Logger is not configured, please call logger.init()')
      );
      return;
    }
    return this.instance.log(level, ...args);
  }

  public log(...args: any[]): void {
    return this.sendToTransport(LogLevels.LOG, ...args);
  }
  public info(...args: any[]): void {
    return this.sendToTransport(LogLevels.INFO, ...args);
  }
  public warn(...args: any[]): void {
    return this.sendToTransport(LogLevels.WARN, ...args);
  }
  public success(...args: any[]): void {
    return this.sendToTransport(LogLevels.SUCCESS, ...args);
  }
  public error(...args: any[]): void {
    return this.sendToTransport(LogLevels.ERROR, ...args);
  }
  private extendConsole(): void {
    console.logger = {
      log: this.log.bind(this),
      info: this.info.bind(this),
      warn: this.warn.bind(this),
      success: this.success.bind(this),
      error: this.error.bind(this),
    };
  }
}

export default LoggerClass;
