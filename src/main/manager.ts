import { app, BrowserWindow } from 'electron';

interface createWindowOption {
  url: string;
  visibleOnAllWorkspaces?: boolean;
  type?: 'normal' | 'transparent' | 'tool';
  devTools?: boolean;
  width?: number;
  height?: number;
  title?: string;
}

const transparentStyle = {
  frame: false,
  transparent: true,
  hasShadow: false,
  maximizable: false,
  minimizable: false,
}

export class WindowManager {
  static createWindow(option: createWindowOption) {
    const {
      url,
      visibleOnAllWorkspaces = true,
      width = 660,
      height = 440,
      title = '新建窗口'
    } = option;
    let win = new BrowserWindow({
      alwaysOnTop: true,
      title,
      width,
      height,
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
        nodeIntegration: true,
        // electorn 5以后需要设置这个属性才能正常访问外部html
        webSecurity: false,
        contextIsolation: false
      },
      backgroundColor: '#35475a',
      show: false
    });

    win.once('ready-to-show', () => {
      win.show();
      win.focus();
    });

    win.loadURL(url);

    win.setVisibleOnAllWorkspaces(visibleOnAllWorkspaces);

    if (app.dock.isVisible()) {
      app.dock.hide();
    }

    return win;
  }
}
