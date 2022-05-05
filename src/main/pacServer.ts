import * as http from 'http';
import * as fs from 'fs';
import { SocksClient } from 'socks';
import { PAC_PATH } from '../share';
import {
  setupSystemProxy,
  loadSetting,
  getAutoConfigUrl,
  loadConfig
} from './utils';

// sock5代理服务器地址
const proxy = { ipaddress: '127.0.0.1', port: 1099, type: 5 };

const logger = console
export class PacServer {
  server = null;
  startup() {
    const { pacPort } = loadSetting();
    const { localPort } = loadConfig();
    const server = http.createServer();

    this.server = server;

    // 请求处理
    server.on('request', (req, res) => {
      fs.readFile(PAC_PATH, {
        encoding: 'utf8'
      }, (err, pac) => {
        if(err) {

        }
        pac = pac.replace(
          /var proxy = ".*"/g,
          `var proxy = "SOCKS5 127.0.0.1:${localPort}; SOCKS 127.0.0.1:${localPort}; DIRECT;"`
        );
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');
        res.end(pac);
      });
    });

    // http 透明代理 connect
    server.on('connect', (req, socketRequest, head) => {
      logger.info('[pacserver]: ' + req.url);

      // 这里协义无关
      const { hostname, port } = new URL('http://' + req.url);

      socketRequest.on('error', err => {
        logger.error('' + err.message);
      });

      const options = {
        // 目标地址和目标端口
        destination: { host: hostname, port: parseInt(port) },
        proxy,
        command: 'connect'
      };

      // @ts-ignore
      SocksClient.createConnection(options)
        .then(({ socket, remoteHost }) => {
          // logger.info('SocksClient connect to ' + remoteHos);

          socket.on('error', function(err) {
            logger.error('' + err.message);
            socketRequest.destroy(err);
          });

          // 建立隧道
          socket.pipe(socketRequest);
          socketRequest.pipe(socket);

          socket.write(head);
          socketRequest.write(
            'HTTP/' + req.httpVersion + ' 200 Connection established\r\n\r\n'
          );
        })
        .catch(err => {
          logger.error(
            err.message +
              ' connection creating on ' +
              proxy.ipaddress +
              ':' +
              proxy.port
          );
          socketRequest.write(
            'HTTP/' + req.httpVersion + ' 500 Connection error\r\n\r\n'
          );
        });
    });

    server.listen(pacPort);

    setupSystemProxy('on', getAutoConfigUrl());
  }

  shutdown() {
    this.server && this.server.close() && (this.server = null);
    setupSystemProxy('off');
  }
}
