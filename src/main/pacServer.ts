import * as http from 'http';
import * as fs from 'fs';
import { PAC_PATH } from '../share';
import { setupSystemProxy, loadSetting, getAutoConfigUrl } from './utils';

export class PacServer {
  server = null;
  startup() {
    const { pacPort } = loadSetting();
    this.server = http
      .createServer((req, res) => {
        let pac = fs.readFileSync(PAC_PATH, {
          encoding: 'utf8'
        });
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
