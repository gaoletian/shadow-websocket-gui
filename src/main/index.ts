import { app, Menu } from "electron";

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== "development") {
  global.__static = require("path")
    .join(__dirname, "/static")
    .replace(/\\/g, "\\\\");
}

import { createTray } from "./tray";
import { initConfig } from "./utils";
// 初始化配置
initConfig();

// 任务栏中不显示
app.dock.hide();

app.on("ready", () => {
  // 设置系统菜单支持复制粘贴 CMD + C  CMD+V
  setApplicationMenu();
  // 创建托盘
  createTray();
});

const nil = () => {};

// ::: tip
// window-all-closed 事件必须处理，
// 否则关闭配置窗口时程序会自动退出
// :::
app.on("window-all-closed", nil);
app.on("activate", nil);

function setApplicationMenu() {
  // Check if we are on a MAC
  if (process.platform === "darwin") {
    // :::tip 添加编辑菜单
    // 若不设置，复制粘贴键盘操作无响应
    // :::
    Menu.setApplicationMenu(
      Menu.buildFromTemplate([
        { role: "appMenu" },
        { role: "fileMenu" },
        { role: "editMenu" },
        { role: "viewMenu" },
        { role: "windowMenu" }
      ])
    );
  }
}
