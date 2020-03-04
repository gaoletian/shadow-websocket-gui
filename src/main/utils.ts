import * as path from 'path';
import * as fs from 'fs';
import * as cp from 'child_process';
import { WORKDIR, APP_NAME, AUTO_CONFIG_URL, CONFIG_DIR, SETTING_PATH, PAC_NAME, PAC_PATH } from '../share';

export const assetPath = (png) => path.join(__static, png);

export const readJsonSync = (path) => {
	return JSON.parse(fs.readFileSync(path, { encoding: 'utf8' }));
};

export const loadConfig = () => {
	const { activeConfig, configs } = loadSetting();
	return configs.find((c) => c.name === activeConfig);
};

export const loadSetting = () => {
	let setting = readJsonSync(SETTING_PATH);
	return setting;
};

export const updateSetting = (newSetting) => {
	let oldSetting = loadSetting();
	const setting = { ...oldSetting, ...newSetting };
	fs.writeFileSync(SETTING_PATH, JSON.stringify(setting, null, 2));
};

export function initConfig() {
	cp.execSync(`mkdir -p ${CONFIG_DIR}`);
	if (!fs.existsSync(SETTING_PATH)) {
		fs.writeFileSync(
			SETTING_PATH,
			JSON.stringify(
				{
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
				},
				null,
				2
			)
		);
	}

	if (!fs.existsSync(PAC_PATH)) {
		cp.execSync(`cp ${assetPath(PAC_NAME)} ${PAC_PATH}`);
	}
}

/**
 * 配置系统代理
 */
export function setupSystemProxy(state) {
	// 配置系统自动代理
	if (state === 'off') {
		cp.execSync(`networksetup -setautoproxystate "WI-FI" off`);
	} else {
		cp.execSync(`networksetup -setautoproxyurl "WI-FI" ${AUTO_CONFIG_URL}`);
	}
}
