const http = require('http');
const { SocksClient } = require('socks');
const logger = console;
// sock5代理服务器地址
const proxy = { ipaddress: '127.0.0.1', port: 1099, type: 5 };

const server = http.createServer();
server.addListener('connect', (req, socketRequest, head) => {
  logger.info('[connect]: ' + req.url);
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

      // tunneling to the host
      socket.pipe(socketRequest);
      socketRequest.pipe(socket);

      socket.write(head);
      socketRequest.write(
        'HTTP/' + req.httpVersion + ' 200 Connection established\r\n\r\n'
      );
      socket.resume();
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

server.listen(8123);

logger.info('listen on 0.0.0.0:8123');
