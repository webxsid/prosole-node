import AlertClass from '../src/service/alerts';

import { AlertTransports, AlertLevels } from '../src/enums';

// tslint:disable-next-line:variable-name
const AlertInstance = new AlertClass();

const alerts = {
  init: AlertInstance.init,
  info: AlertInstance.info,
  warn: AlertInstance.warn,
  success: AlertInstance.success,
  error: AlertInstance.error,
};

const alertLevels: {
  INFO: string;
  SUCCESS: string;
  WARN: string;
  ERROR: string;
} = {
  INFO: AlertLevels.INFO,
  SUCCESS: AlertLevels.SUCCESS,
  WARN: AlertLevels.WARN,
  ERROR: AlertLevels.ERROR,
};

const alertTransports: {
  SLACK: string;
  HTTP: string;
} = {
  SLACK: AlertTransports.SLACK,
  HTTP: AlertTransports.HTTP,
};

export default alerts;
export { alertLevels, alertTransports };
