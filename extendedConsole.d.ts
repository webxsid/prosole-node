export {};
declare global {
  interface Console {
    logger?: {
      log: (...args: any[]) => void;
      info: (...args: any[]) => void;
      warn: (...args: any[]) => void;
      success: (...args: any[]) => void;
      error: (...args: any[]) => void;
    };
    alert?: {
      info: (message: string, channel?: string, extraData?: any[]) => void;
      warn: (message: string, channel?: string, extraData?: any[]) => void;
      error: (message: string, channel?: string, extraData?: any[]) => void;
      success: (message: string, channel?: string, extraData?: any[]) => void;
    };
  }
}
