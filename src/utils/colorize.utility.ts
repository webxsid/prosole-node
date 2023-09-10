import { LoggerColors } from "../enums/logger_config.enum";

export const colorize = {
  red: (message: string) =>
    `${LoggerColors.RED}${message}${LoggerColors.RESET}`,
  green: (message: string) =>
    `${LoggerColors.GREEN}${message}${LoggerColors.RESET}`,
  yellow: (message: string) =>
    `${LoggerColors.YELLOW}${message}${LoggerColors.RESET}`,
  blue: (message: string) =>
    `${LoggerColors.BLUE}${message}${LoggerColors.RESET}`,
  magenta: (message: string) =>
    `${LoggerColors.MAGENTA}${message}${LoggerColors.RESET}`,
  cyan: (message: string) =>
    `${LoggerColors.CYAN}${message}${LoggerColors.RESET}`,
  white: (message: string) =>
    `${LoggerColors.WHITE}${message}${LoggerColors.RESET}`,
};
