v0.0.4 / 2020-05-13
===================

### 🐛 Bug Fixes

- `general`
  - Type error
  - Proxy.pac update by localPort change


### 🚀 Features

- `general`
  - Add type define
  - Support switch server from trayMenu  & auto restart


### 🏡 Chore

- `general`
  - Add release script


### 💖 Thanks to

- gaoletian

# v0.0.3 / 2020-04-29

### 🚀 Features

- `general`
  - Config window now can visible on all workspaces
  - Supoort get pacServer port from setting
  - Set configWin's type is BrowserWindow
  - Change app icon

### 🏡 Chore

- `scripts`
  - Add changelog and verifyCommit
- `debug`
  - Update debug config and docs
  - Main process debug support
- `general`
  - Reformat webpack.main.config.js
  - Use prettier-vscode as default formater

### 💖 Thanks to

- gaoletian
- 高乐天

# v0.0.2 / 2020-03-10

- release: v0.0.2
- feat: revert tray main menu
- fix: 程序初始化时无法复制 proxy.pac closed #3
- chore: use prettier format all ts and js file
- build: ci script update only support mac

# v0.0.1 / 2020-03-06

- docs: add todo list
- ci: build for mac
- chore: reformat code
- docs: update readme
- dep: add @types/webpack-env
- fefactor: rename share.js to share.ts and move top
- fix(render): add .ts to resolve.extensions
- build(render): repace node-sass with sass
- Merge pull request #1 from gaoletian/typescript
- feat: support typescript at main and render
- wip: support typescript
- feat: 动态重建托盘菜单，增加服务列表
- fix: use default applicationMenu(file|edit|...)
- docs: update readme
- first commit
