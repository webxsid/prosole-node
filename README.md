# Prosole

[![npm version](https://img.shields.io/npm/v/prosole.svg)](https://www.npmjs.com/package/prosole) [![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/sm2101prosole/blob/master/LICENSE)
Prosole is an all-in-one logger and alerts utility designed for Node.js applications. It simplifies the process of logging information and generating alerts, making it an essential tool for developers looking to monitor, manage, and debug their Node.js projects.

## Change Log

- v0.1.1
  - Fixed Interface Issue with logger and alert initialization

## Features

### Logger Utility

- **Transport Configuration**:
  - Specify one of three supported transports: console, file, or Socket.IO.
  - Logs are directed to the specified transport, allowing customization based on different environments.
- **Custom Base Log Level**:
  - Set a base log level to filter log messages, allowing you to ignore messages below this level.
  - Log levels range from "Log" (lowest) to "Error" (highest).
- **Selective Logging**:
  - Enable or disable logging by specifying a transport; no logs will be printed if no transport is specified.
  - This feature provides flexibility in managing logging for different scenarios and environments.
- **Console Integration**:
  - Optionally extend the Node.js console object to seamlessly integrate logging features directly into it.
  - Note that this feature is turned off by default and may not be recommended for all use cases.

### Alert Utility

- **Transport Configuration**:
  - Choose from multiple alert transports, including Discord, Slack, or custom HTTP requests.
  - Set up different transports for different environments.
- **Selective Alerting**:
  - Define alerting behavior by specifying a transport; no alerts will be sent if no transport is specified.
  - This feature allows you to adapt alerting to your specific requirements and scenarios.
- **Integration with Third-Party Platforms**:
  - Send alert messages to third-party platforms like Slack for immediate notification.
  - Also, send HTTP requests to a custom server to facilitate alerting.
- **Console Integration**:
  - Optionally extend the Node.js console object to seamlessly integrate alerting features directly into it.
  - Note that this feature is turned off by default and may not be suitable for all use cases.

You can easily install Prosole via npm or yarn to start using it in your Node.js projects. Choose one of the following methods to get started:

## Installation

### Using npm

```bash
npm install prosole --save
```

### Using yarn

```bash
yarn add prosole
```

## Basic Usage

Getting started with Prosole is quick and straightforward. Follow these steps to integrate the Logger and Alert Utility into your Node.js project:

### Importing the Package

You can import the Prosole package in your Node.js application using either ES6 import or CommonJS require syntax:

**Using ES6 Import:**

```javascript
import { logger, alerts } from "prosole";
```

**Using CommonJS Require:**

```javascript
const { logger, alerts } = require("prosole");
```

### Initializing the Logger

To begin using the logger, initialize it with your project details, preferred transport, and other configuration options:

```javascript
logger.init({
  project: {
    name: "YourProjectName",
    version: "1.0.0", // will default to 1.0.0 if not specified
  },
  transport: "console", // Choose your preferred transport (e.g., "console", "file", "Socket.IO" or null to bypass)
  env: "development", // Set the environment context
});
```

### Initializing Alerts

To set up alerting, initialize it with your project details, preferred alert transport (e.g., Discord), and other relevant options:

```javascript
alerts.init({
  project: {
    name: "YourProjectName",
    version: "1.0.0",
  },
  transport: "slack", // Choose your preferred alert transport ("slack", "http" or null to bypass )
  environment: "development", // Set the environment context
  slack: {
    channels: {
      "channel-name":<webhook url>
    },
  },
});
```

### Getting the Slack Webhook URL

To send alerts to Slack, you need to provide a webhook URL. You can get this URL by using the "incoming webhook" feature in Slack. Click [here](https://github.com/sm2101/prosole/blob/main/Documentation/Alerts/Slack.md) to see how to set up an incoming webhook in Slack.

### Actual Usage

Now that you have initialized the Logger and Alert Utility, you can start using them in your code. Here's how you can log an error message and send an alert message:

#### Logging an Error Message

```javascript
logger.error("This is an error",...<more data>);
```

#### Sending an alert using Slack

```javascript
alerts.error("This is an error alert", "<slack-channel>");
```

#### Sending an alert using HTTP

```javascript
alerts.error("This is an error alert");
```

These simple examples demonstrate how to use Prosole for logging and alerting in your Node.js application. Customize the log and alert messages, as well as the destinations, to meet your specific needs.

For more detailed usage examples and additional features, please refer to the documentation or code samples provided in the repository.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## Support

If you have any questions or issues, please open an issue on the [GitHub repository](https://github.com/sm2101/prosole-node).

## Author

- Siddharth Mittal
  - GitHub: [sm2101](https://github.com/sm2101)
  - Portfolio: [https://webxsid.com](https://webxsid.com)
