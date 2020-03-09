//

import { BrowserWindow } from "electron";

let win = null;
const winURL = "https://www.yuque.com/";

// 创建配置窗口
function createWindow() {
  win = new BrowserWindow({
    alwaysOnTop: true,
    title: "客户端配置",
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
    titleBarStyle: "default",
    webPreferences: {
      devTools: true,
      nodeIntegration: false
    },
    backgroundColor: "#35475a",
    show: false
  });
  win.on("close", () => {
    win = null;
  });
  win.once("ready-to-show", () => {
    win.show();
    win.focus();
    // win.setAlwaysOnTop(true, 'modal-panel');
  });
  // win.loadURL(`file://${assetPath('index.html')}`);
  win.loadURL(winURL);
}

export function show() {
  if (win) {
    win.close();
  }
  createWindow();
}

export function close() {
  if (win) {
    win.close();
  }
}
