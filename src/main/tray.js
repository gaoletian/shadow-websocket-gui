import { app, Tray, Menu, App, globalShortcut, ipcMain } from 'electron';
import { proxy } from './proxyServer';
import * as cp from 'child_process';
import { assetPath, loadConfig } from './utils';
import { showConfigWindow, close } from './configwin';
import { CONFIG_DIR, AUTO_CONFIG_URL } from './const';

let tray = null;
let contextMenu = null;

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
	return Menu.buildFromTemplate([
		{
			label: '运行',
			click: function() {
				proxyStartup();
			}
		},
		{
			label: '停止',
			visible: false,
			click: function() {
				proxy.shutdown();
			}
		},
		{ type: 'separator' },
		{
			label: '配置',
			submenu: Menu.buildFromTemplate([
				{
					label: '修改配置 [Cmd+Shift+S]',
					click: function() {
						showConfigWindow();
					}
				},
				{
					label: '查看 proxy.pac',
					click: function() {
						cp.execSync('open ' + AUTO_CONFIG_URL);
					}
				},
				{
					label: '打开配置目录',
					click: function() {
						cp.execSync('open ' + CONFIG_DIR);
					}
				}
			])
		},
		{
			label: '退出',
			click: async function() {
				await proxy.shutdown();
				tray = null;
				app.quit();
			}
		}
	]);
}

// 更新托盘菜单及图标
function updateMenu() {
	contextMenu.items[0].visible = !proxy.running;
	contextMenu.items[1].visible = proxy.running;
	tray.setImage(proxy.running ? assetPath('icon/running.png') : assetPath('icon/normal.png'));
}

function proxyStartup() {
	const config = loadConfig();
	proxy.setConfig(config);
	proxy.startup();
}

ipcMain.on('async-message', (event, arg) => {
	proxy.shutdown();
	setTimeout(() => {
		proxyStartup();
	}, 2000);
});
