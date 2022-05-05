import {
  BrowserWindow,
  BrowserWindowConstructorOptions,
  ipcMain,
  screen,
  app
} from 'electron';
import path from 'path';

import * as remoteMain from '@electron/remote/main';

export let hubwin: BrowserWindow = null;

let timeout = null;
let hwidth = 128;
export const resize = (width, height) => {
  hubwin.setSize(width, height, false);
};

const dockOnscreenRight = (win: BrowserWindow) => {
  const workArea = screen.getAllDisplays()[0].bounds;
  win.setPosition(workArea.width - 36, workArea.height / 6);
};


export function showHubWin() {

  const options: BrowserWindowConstructorOptions = {
    movable: true,
    alwaysOnTop: true,
    // titleBarStyle: 'hiddenInset',
    width: 320,
    height: 320,
    show: false,
    minimizable: false,
    fullscreenable: false,
    maximizable: false,
    resizable: false,
    frame: true,
    center: false,
    transparent: false,//true,
    hasShadow: false,
    webPreferences: {
      devTools: true,
      nodeIntegration: true,
      // electorn 5以后需要设置这个属性才能正常访问外部html
      webSecurity: false,
      nodeIntegrationInWorker: true,
      preload:
        process.env.NODE_ENV === 'development'
          ? path.resolve(__dirname, 'preload.js')
          : `file://${app.getAppPath()}/preload.js`,
      contextIsolation: false
    }
  };


  const win = (hubwin = new BrowserWindow(options));
  // const winURL =
  //   process.env.NODE_ENV === 'development'
  //     ? `http://localhost:3000`
  //     : `file://${__dirname}/h5hub/index.html`;
  const devUrl = `http://localhost:3000`;
  const pordUrl = `file:///Users/gaoletian/works/shadow-websocket/shadow-websocket-gui/h5hub/index.html`;
  // const pordUrl = `file:///Users/gaoletian/works/shadow-websocket/shadow-websocket-gui/dist/electron/index.html`;

  const winURL = process.env.NODE_ENV === 'development' ? devUrl : pordUrl;
  win.loadURL(devUrl);
  win.on('ready-to-show', () => {
    dockOnscreenRight(win);
    win.show();
  });

  // win.setVisibleOnAllWorkspaces(true)
  win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });

  win.webContents.unselect();

  // 启用 remote
  remoteMain.enable(win.webContents);
}

ipcMain.on('hub', (event, ...arg) => {
  console.log('=====>', arg);
  const [action, { width, height }] = arg;
  resize(width, height);
});
