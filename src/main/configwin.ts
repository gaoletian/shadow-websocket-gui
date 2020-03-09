import { BrowserWindow } from 'electron';
import { assetPath } from './utils';

let configWin = null;

const winURL =
  process.env.NODE_ENV === 'development'
    ? `http://localhost:9080`
    : `file://${__dirname}/index.html`;

// 创建配置窗口
function createConfigWindow() {
  configWin = new BrowserWindow({
    alwaysOnTop: true,
    title: '客户端配置',
    width: 660,
    height: 440,
    resizable: true,
    maximizable: false,
    minimizable: false,
    movable: true,
    // modal: true,
    fullscreen: false,
    fullscreenable: false,
    // frame: false,
    darkTheme: true,
    titleBarStyle: 'default',
    webPreferences: {
      devTools: true,
      nodeIntegration: true
    },
    backgroundColor: '#35475a',
    show: false
  });
  configWin.on('close', () => {
    configWin = null;
  });
  configWin.once('ready-to-show', () => {
    configWin.show();
    configWin.focus();
    // configWin.setAlwaysOnTop(true, 'modal-panel');
  });
  // configWin.loadURL(`file://${assetPath('index.html')}`);
  configWin.loadURL(winURL);
}

export function showConfigWindow() {
  if (configWin) {
    configWin.close();
  }
  createConfigWindow();
}

export function close() {
  if (configWin) {
    configWin.close();
  }
}
