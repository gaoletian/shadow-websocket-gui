import { BrowserWindow } from 'electron';
import { WindowManager } from './manager';

const isDev = process.env.NODE_ENV === 'development';

let configWin: BrowserWindow = null;

export function showConfigWindow() {
  if (configWin) return;

  configWin = WindowManager.createWindow({
    url: isDev ? 'http://localhost:9080' : `file://${__dirname}/index.html`,
    type: 'tool',
    width: 660,
    height: 440,
    title: '服务器配置',
    devTools: isDev
  });

  configWin.on('close', () => (configWin = null));
}
