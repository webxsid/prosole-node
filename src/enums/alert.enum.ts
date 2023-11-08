enum AlertLevels {
  INFO = "info",
  SUCCESS = "success",
  WARN = "warn",
  ERROR = "error",
}

enum AlertTransports {
  SLACK = "slack",
  HTTP = "http",
}

enum ALERT_COLORS {
  INFO = "#3498db",
  SUCCESS = "#2ecc71",
  WARNING = "#f1c40f",
  ERROR = "#e74c3c",
}

export { AlertLevels, AlertTransports, ALERT_COLORS };
