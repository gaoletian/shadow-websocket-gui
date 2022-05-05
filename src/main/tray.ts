import { app, Tray, Menu, App, globalShortcut, ipcMain, MenuItemConstructorOptions } from 'electron';
import { proxy } from './proxyServer';
import * as cp from 'child_process';
import {
  assetPath,
  loadConfig,
  loadSetting,
  getAutoConfigUrl,
  updateSetting
} from './utils';
import { showConfigWindow } from './configwin';
import { CONFIG_DIR, AUTO_CONFIG_URL } from '../share';
// import {showHubWin} from './windows/hubHelper'

let tray: Tray = null;
let contextMenu: Menu = null;

export function createTray() {
  // 注册全局快捷键
  globalShortcut.register('CmdOrCtrl+Shift+S', () => {
    showConfigWindow();
  });
  // 托盘菜单
  contextMenu = createTrayMenu();
  // 创建托盘
  tray = new Tray(assetPath('icon/normal.png'));
  tray.setContextMenu(contextMenu);
  proxy.on('startup', updateMenu);
  proxy.on('shutdown', updateMenu);
}

function createTrayMenu() {
  const { activeConfig, pacPort } = loadSetting();
  const currentConfig = loadConfig();
  let menusList: MenuItemConstructorOptions[] = [
    { type: 'separator' },
    {
      label: `sock://127.0.0.1:${currentConfig.localPort}`,
      click: function() {
        // showConfigWindow();
      }
    },
    { type: 'separator' },
    {
      label: `http://127.0.0.1:${pacPort}`,
      // click: function() {
      //   // showConfigWindow();
      // }
    },
    { type: 'separator' },
    {
      type: 'submenu',
      label: '' + activeConfig,
      submenu: makeConfigList()
    },
    { type: 'separator' },
    // {
    //   label: 'h5hub 助手',
    //   click: async function() {
    //     try {
    //       showHubWin()
    //     } catch(err) {
    //       console.error(err)
    //     }
        
    //   }
    // },
    {
      label: '退出',
      click: async function() {
        await proxy.shutdown();
        tray = null;
        app.quit();
      }
    }
  ];
  if (!proxy.running) {
    menusList.unshift({
      label: `启动服务`,
      click: function() {
        proxyStartup();
      }
    });
  } else {
    menusList.unshift({
      label: `停止服务`,
      click: function() {
        proxy.shutdown();
      }
    });
  }
  return Menu.buildFromTemplate(menusList);
}

// 更新托盘菜单及图标
function updateMenu() {

  makeConfigList()

  tray.setImage(
    proxy.running ? assetPath('icon/running.png') : assetPath('icon/normal.png')
  );
  tray.setContextMenu(createTrayMenu());
}

function makeConfigList() {
  const { configs, activeConfig} = loadSetting();
  return Menu.buildFromTemplate([
    {
      label: '修改配置 [Cmd+Shift+S]',
      click: function() {
        showConfigWindow();
      }
    },
    {
      label: '查看 proxy.pac',
      click: function() {
        cp.execSync('open ' + getAutoConfigUrl());
      }
    },
    {
      label: '打开配置目录',
      click: function() {
        cp.execSync('open ' + CONFIG_DIR);
      }
    },
    { type: 'separator' },
    ...configs.map(it => {
      return {
        type: 'checkbox',
        checked: activeConfig === it.name,
        label: it.name,
        click: () => {
          if (activeConfig === it.name) return false;
          updateSetting({ activeConfig: it.name });
          proxyStartup();
          updateMenu();
        }
      } as const;
    })
  ]);
}

function proxyStartup() {
  const config = loadConfig();
  proxy.setConfig(config);
  proxy.restart();
}

ipcMain.on('async-message', (event, arg) => {
  proxy.shutdown();
  setTimeout(() => {
    proxyStartup();
  }, 1000);
});
