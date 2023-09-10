enum LoggerLevel {
  ERROR = "error",
  WARN = "warn",
  INFO = "info",
  DEBUG = "debug",
}

enum LoggerTransport {
  CONSOLE = "console",
  FILE = "file",
  STREAM = "stream", // Firebase
  HTTP = "http",
  SOCKET_IO = "socket_io",
  SLACK = "slack",
  DISCORD = "discord",
}

enum LoggerFileTypes {
  JSON = "json",
  LOG = "log",
  TXT = "txt",
}

enum LoggerColors {
  RED = "\x1b[31m",
  GREEN = "\x1b[32m",
  YELLOW = "\x1b[33m",
  BLUE = "\x1b[34m",
  MAGENTA = "\x1b[35m",
  CYAN = "\x1b[36m",
  WHITE = "\x1b[37m",
  RESET = "\x1b[0m",
}

export { LoggerLevel, LoggerTransport, LoggerFileTypes, LoggerColors };
// Path: src/enums/transport_config.enum.ts
// Compare this snippet from src/interfaces/transport_config.interface.ts:
