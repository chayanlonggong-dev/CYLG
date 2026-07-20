export interface RedisClientConfig {
  url?: string;
}

class RedisClient {
  private connected = false;

  private url: string;

  constructor(
    config?: RedisClientConfig
  ) {
    this.url =
      config?.url ??
      process.env.REDIS_URL ??
      "";
  }

  async connect() {
    /*
      開發環境使用 Memory Cache。
      生產環境可替換為 ioredis / redis package。
    */

    this.connected = true;

    return this.connected;
  }

  async disconnect() {
    this.connected = false;

    return true;
  }

  isConnected() {
    return this.connected;
  }

  getUrl() {
    return this.url;
  }

  async ping() {
    if (!this.connected) {
      return false;
    }

    return true;
  }
}

export const redisClient =
  new RedisClient();