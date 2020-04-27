import * as path from 'path';
import * as fs from 'fs';
import * as cp from 'child_process';
import {
  WORKDIR,
  APP_NAME,
  AUTO_CONFIG_URL,
  CONFIG_DIR,
  SETTING_PATH,
  PAC_NAME,
  PAC_PATH
} from '../share';

const DefaultSetting = {
  activeConfig: 'herokuapp',
  pacPort: 8989,
  configs: [
    {
      name: 'herokuapp',
      localAddress: '127.0.0.1',
      localPort: '1099',
      method: 'aes-256-cfb',
      password: 'Gg3619323',
      serverAddress: 'glt-app.herokuapp.com',
      serverPort: '80'
    }
  ]
};

export const assetPath = png => path.join(__static, png);

export const readJsonSync = path => {
  return JSON.parse(fs.readFileSync(path, { encoding: 'utf8' }));
};

export const loadConfig = () => {
  const { activeConfig, configs } = loadSetting();
  return configs.find(c => c.name === activeConfig);
};

export const loadSetting = () => {
  let setting = readJsonSync(SETTING_PATH) as typeof DefaultSetting;
  return setting;
};

export const getAutoConfigUrl = () => {
  const { pacPort } = loadSetting();
  return 'http://127.0.0.1:' + pacPort + '/proxy.pac';
};

export const updateSetting = newSetting => {
  let oldSetting = loadSetting();
  const setting = { ...oldSetting, ...newSetting };
  fs.writeFileSync(SETTING_PATH, JSON.stringify(setting, null, 2));
};

export function initConfig() {
  cp.execSync(`mkdir -p ${CONFIG_DIR}`);
  if (!fs.existsSync(SETTING_PATH)) {
    fs.writeFileSync(SETTING_PATH, JSON.stringify(DefaultSetting, null, 2));
  }

  if (!fs.existsSync(PAC_PATH)) {
    // fs.readFileSync从 asar文件中读取并写入到指定路由，代替 cp命令
    // https://github.com/gaoletian/shadow-websocket-gui/issues/3
    // 在 Electron 中有两类 APIs：Node.js 提供的 Node API 和 Chromium 提供的 Web API。 这两种 API 都支持从 asar 档案中读取文件

    let pacfile = fs.readFileSync(`${assetPath(PAC_NAME)}`, {
      encoding: 'utf8'
    });
    fs.writeFileSync(PAC_PATH, pacfile);
  }
}

/**
 * 配置系统代理
 */
export function setupSystemProxy(state: 'off' | 'on', pac_url?: string) {
  // 配置系统自动代理
  if (state === 'off') {
    cp.execSync(`networksetup -setautoproxystate "WI-FI" off`);
  } else {
    cp.execSync(`networksetup -setautoproxyurl "WI-FI" ${pac_url}`);
  }
}
