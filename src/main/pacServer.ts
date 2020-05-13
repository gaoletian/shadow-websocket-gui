import * as http from 'http';
import * as fs from 'fs';
import { PAC_PATH } from '../share';
import {
  setupSystemProxy,
  loadSetting,
  getAutoConfigUrl,
  loadConfig
} from './utils';

export class PacServer {
  server = null;
  startup() {
    const { pacPort } = loadSetting();
    const { localPort } = loadConfig();
    this.server = http
      .createServer((req, res) => {
        let pac = fs.readFileSync(PAC_PATH, {
          encoding: 'utf8'
        });
        pac = pac.replace(
          /var proxy = ".*"/g,
          `var proxy = "SOCKS5 127.0.0.1:${localPort}; SOCKS 127.0.0.1:${localPort}; DIRECT;"`
        );
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');
        res.end(pac);
      })
      .listen(pacPort);

    setupSystemProxy('on', getAutoConfigUrl());
  }
  shutdown() {
    this.server && this.server.close() && (this.server = null);
    setupSystemProxy('off');
  }
}
