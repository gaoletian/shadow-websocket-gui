import {
  app,
  Tray,
  Menu,
  App,
  globalShortcut,
  ipcMain,
  MenuItemConstructorOptions
} from "electron";
import { proxy } from "./proxyServer";
import * as cp from "child_process";
import { assetPath, loadConfig, loadSetting } from "./utils";
import { showConfigWindow, close } from "./configwin";
import { CONFIG_DIR, AUTO_CONFIG_URL } from "../share";

let tray = null;
let contextMenu = null;

export function createTray() {
  // 注册全局快捷键
  globalShortcut.register("CmdOrCtrl+Shift+S", () => {
    showConfigWindow();
  });
  // 托盘菜单
  contextMenu = createTrayMenu();
  // 创建托盘
  tray = new Tray(assetPath("icon/normal.png"));
  tray.setContextMenu(contextMenu);
  proxy.on("startup", updateMenu);
  proxy.on("shutdown", updateMenu);
}

function createTrayMenu() {
  const { activeConfig } = loadSetting();
  let menusList: MenuItemConstructorOptions[] = [
    { type: "separator" },
    {
      label: "配置列表",
      submenu: makeConfigList()
    },
    {
      label: "记笔记",
      click() {}
    },
    {
      label: "写文章",
      click() {}
    },
    {
      label: "网址收藏",
      click() {}
    },
    { type: "separator" },
    {
      label: "退出",
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
  tray.setImage(
    proxy.running ? assetPath("icon/running.png") : assetPath("icon/normal.png")
  );
  tray.setContextMenu(createTrayMenu());
}

function makeConfigList() {
  const { configs, activeConfig } = loadSetting();
  return Menu.buildFromTemplate([
    {
      label: "修改配置 [Cmd+Shift+S]",
      click: function() {
        showConfigWindow();
      }
    },
    {
      label: "查看 proxy.pac",
      click: function() {
        cp.execSync("open " + AUTO_CONFIG_URL);
      }
    },
    {
      label: "打开配置目录",
      click: function() {
        cp.execSync("open " + CONFIG_DIR);
      }
    },
    { type: "separator" },
    ...configs.map(it => {
      return {
        type: "checkbox",
        checked: activeConfig === it.name,
        label: it.name,
        click() {}
      };
    })
  ]);
}

function proxyStartup() {
  const config = loadConfig();
  proxy.setConfig(config);
  proxy.restart();
}

ipcMain.on("async-message", (event, arg) => {
  proxy.shutdown();
  setTimeout(() => {
    proxyStartup();
  }, 1000);
});
