import { getLogger } from 'log4js';
import { PacServer } from './pacServer';
import { TCPRelay } from 'shadowsocks-websocket';
import { EventEmitter } from 'events';

let logger = getLogger('shadowwebsocks');

class ProxyServer extends EventEmitter {
  relay = null;
  pacServer = null;
  config = {
    method: '',
    localAddress: '127.0.0.1',
    localPort: 1099,
    password: '',
    serverAddress: '0.0.0.0',
    serverPort: 80
  };
  running = false;

  constructor() {
    super();
    this.pacServer = new PacServer();
  }

  setConfig(config) {
    this.config = config;
  }

  initRelay() {
    this.relay = new TCPRelay(this.config, true);
  }

  // 启动服务
  async startup() {
    this.running && (await this.shutdown());

    // 初始化中继器实例
    this.initRelay();

    // 启动pacServer
    this.pacServer.startup();

    const { localAddress, localPort } = this.config;

    try {
      await this.relay.setLogLevel('info').bootstrap();
      logger.info(`服务已启动 ${localAddress}:${localPort}`);
      this.running = true;
      // 发射事件
      this.emit('startup');
    } catch (err) {
      logger.error(err);
      this.running = false;
    }
  }

  // 停止服务
  async shutdown() {
    try {
      await this.relay.stop();
    } catch (err) {
      logger.info(err);
    } finally {
      logger.info('服务已停止');
      this.relay = null;
      this.running = false;
      this.pacServer.shutdown();
      // 发射事件
      this.emit('shutdown');
      return Promise.resolve(true);
    }
  }

  async restart() {
    await this.shutdown();
    await this.startup();
  }
}

export const proxy = new ProxyServer();
