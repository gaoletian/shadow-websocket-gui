const { ipcRenderer: ipc, remote } = require('electron');
const { exec, execSync } = require('child_process');
const { readJSON, writeJSON } = require('fs-extra');
const path = require('path');
const { promisify } = require('util');
const fs = require('fs');
const HOME = process.env.HOME;
const DATA = '.devhelper';
const WORK_DIR = process.cwd();

const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);

const dataPath = fpath => path.join(HOME, DATA, fpath);

console.log(path, fs);

init();

function init() {
  window.Bridge = {
    getBrowserWindow: () => remote.getCurrentWindow(),
    setSize: (width, height) => {
      remote.getCurrentWindow().setSize(width, height);
    },
    setPosition: (x, y) => {
      remote.getCurrentWindow().setPosition(x, y);
    },
    setBounds: (x, y, width, height) => {
      let old = remote.getCurrentWindow().getBounds();
      old.x;
      remote.getCurrentWindow().setBounds({ x, y, width, height });
    },
    getBounds: () => {
      return remote.getCurrentWindow().getBounds();
    },
    setOffset: (offsetX, offsetY) => {
      const [x, y] = remote.getCurrentWindow().getPosition();
      remote.getCurrentWindow().setPosition(x + offsetX, y + offsetY);
    },
    getAuthInfo: getAuthInfo,
    hubpage: GotoH5HubPage,
    exec: cmd => exec(cmd),
    getDomainNameAndBookCodeFromChrome: cmd => {
      let res = execSync(
        'osascript ' +
          path.join(__dirname, 'getDomainNameAndBookCodeFromChrome.applescript')
      ).toString();

      return res.split('\n').filter(it => it.includes('-cloud.chanjet.com'));
    },
    readJson: filename => JSON.parse(readFileAsync(filename, 'utf8')),
    writeJson: (filename, data) => writeFileAsync(filename, data),
    readJSON,
    writeJSON,
    dataPath,
    remote,
  };

  ipc.on('authinfo', (...args) => {
    window.Bridge.authinfo(...args);
  });
}

async function getAuthInfo() {
  return remote.app.GlobalStore.authinfo;
}

function GotoH5HubPage(pagePath, isLocal = false) {
  const {
    appName,
    domainName,
    bookCode,
    passport,
    cc_server_env
  } = remote.app.GlobalStore.authinfo;
  const urlParams = Object.entries({ appName, domainName, bookCode, passport })
    .map(pair => pair.join('='))
    .join('&');
  const prefix = {
    prod: '',
    inte: 'inte-',
    test: 'test-',
    'pre-test': 'pre-test-',
    moni: '',
    dev: 'dev-'
  }[cc_server_env];
  const pageUrl = isLocal
    ? `http://localhost:8080${pagePath}?${urlParams}`
    : `https://${prefix}chanjet-h5-hub.chanjet.com${pagePath}?${urlParams}`;
  console.log('GotoH5HubPage', pageUrl);
  exec(`open "${pageUrl}"`);
}
