export class Logger {
  public static info(message: string, meta?: unknown): void {
    const timestamp = new Date().toISOString();
    if (meta) {
      console.log(`[${timestamp}] [INFO] ${message}`, JSON.stringify(meta));
    } else {
      console.log(`[${timestamp}] [INFO] ${message}`);
    }
  }

  public static warn(message: string, meta?: unknown): void {
    const timestamp = new Date().toISOString();
    if (meta) {
      console.warn(`[${timestamp}] [WARN] ${message}`, JSON.stringify(meta));
    } else {
      console.warn(`[${timestamp}] [WARN] ${message}`);
    }
  }

  public static error(message: string, error?: unknown): void {
    const timestamp = new Date().toISOString();
    if (error instanceof Error) {
      console.error(`[${timestamp}] [ERROR] ${message}: ${error.message}\n${error.stack}`);
    } else if (error) {
      console.error(`[${timestamp}] [ERROR] ${message}:`, error);
    } else {
      console.error(`[${timestamp}] [ERROR] ${message}`);
    }
  }
}
