import { LogColors } from '../enums';

export const colorize = {
  error: (message: string) => `${LogColors.error}${message}${LogColors.reset}`,
  success: (message: string) =>
    `${LogColors.success}${message}${LogColors.reset}`,
  warn: (message: string) => `${LogColors.warn}${message}${LogColors.reset}`,
  info: (message: string) => `${LogColors.info}${message}${LogColors.reset}`,
  log: (message: string) => `${LogColors.log}${message}${LogColors.reset}`,
};
