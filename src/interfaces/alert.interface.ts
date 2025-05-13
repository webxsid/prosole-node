import { AlertTransports, AlertLevels } from '../enums';
interface SlackAlert {
  channels: {
    [channel: string]: string;
  };
}

interface DiscordAlert {
  channels: {
    [channel: string]: string;
  };
}

interface ApiAlert {
  alertUrl: string;
  headers?: {
    [key: string]: string;
  };
  healthCheck?: {
    path: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  };
  body?: (
    type: AlertLevels,
    project: {
      name: string;
      version?: string;
    },
    environment: string,
    alert: any
  ) => any;
}

interface Alert {
  project: {
    name: string;
    version?: string;
  };
  environment: string;
  transport: string | null;
  extendConsole?: boolean;
  slack?: SlackAlert;
  // discord?: DiscordAlert;
  http?: ApiAlert;
}

export { SlackAlert, DiscordAlert, ApiAlert, Alert };
