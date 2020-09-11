<template lang="pug">
#app
  el-container
    el-aside(width='220px',style="-webkit-app-region: drag")
      h1 配置列表
      ul
        li.list-item(
            v-for="(c, index) in configs", 
            :class="index === current ? 'active' : ''", 
            :key='c.serverAddr' 
            @click="current = index"
          )
          i(:class="activeConfig === c.name ? 'el-icon-connection' : 'el-icon-link'", :style="{color: activeConfig === c.name ? 'rgb(0, 255, 0)': '#999'}")
          span(style="padding-left: 12px;") {{c.name}}
          
          el-popover(trigger="click", placement="right", class="custom-pop")
            el-row
              el-col
                el-button(type="primary", size="small",icon="el-icon-connection", @click="popVisible = false; active()") 启用
              el-col
                el-button(size="small",icon="el-icon-edit", @click="popVisible = false; showDialog('edit')") 改名
              el-col
                el-button(size="small",icon="el-icon-delete",@click="removeConfig") 删除
            div(slot="reference")
              i.popmenu(class='el-icon-more')
      div.sticky
        el-button(type='success', size='small', @click='showDialog', icon='el-icon-plus') 新建
    el-main
      div.cell
        div.flex1
          h3(style="margin-top: 0px; color: #012f8a") {{configs[current].name}}
        div
          el-button(type="primary", size="small", @click='save') 保存配置
      el-divider
      el-form(label-position='left', label-width='100px',size="small")
        el-form-item(label="服务地址")
          el-input(v-model="configs[current].serverAddress")
        el-form-item(label="服务端口")
          el-input(v-model="configs[current].serverPort")
        el-form-item(label="本地地址")
          el-input(v-model="configs[current].localAddress")
        el-form-item(label="本地端口")
          el-input(v-model="configs[current].localPort")
        el-form-item(label="加密方法")
          el-select(v-model="configs[current].method")
            el-option(v-for="m in methods", :key="m", :label="m", :value="m")
        el-form-item(label="密码")
          el-input(v-model="configs[current].password", type="password", show-password)

  // 编辑对话框
  el-dialog(:modal='true', :visible.sync='isShowDialog', title='配置名称', :close-on-click-modal='false')
    el-input(v-model="configName", )
    span(slot="footer" class="dialog-footer")
      el-button(@click="isShowDialog = false") 取 消
      el-button(type="primary",@click="upsertConfig") 确 定
  </span>
</template>

<script lang="ts">
import { ipcRenderer } from 'electron';
import { loadSetting, updateSetting } from '../main/utils';
import { Vue, Component } from 'vue-property-decorator';

const setting = loadSetting();

@Component({})
export default class App extends Vue {
  configName = '';
  popVisible = false;
  isShowDialog = false;
  isEdit = false;
  configs = setting.configs;
  activeConfig = setting.activeConfig;
  current =
    setting.configs.findIndex(c => c.name === setting.activeConfig) || 0;
  methods = [
    'rc4',
    'rc4-md5',
    'table',
    'bf-cfb',
    'des-cfb',
    'rc2-cfb',
    'idea-cfb',
    'seed-cfb',
    'cast5-cfb',
    'aes-128-cfb',
    'aes-192-cfb',
    'aes-256-cfb',
    'camellia-256-cfb',
    'camellia-192-cfb',
    'camellia-128-cfb'
  ];

  showDialog(edit?: 'edit') {
    this.configName = edit === 'edit' ? this.configs[this.current].name : '';
    this.isEdit = edit === 'edit';

    this.isShowDialog = true;
  }

  active(configName) {
    this.activeConfig = this.configs[this.current].name;
    this.save();
    ipcRenderer.send('async-message', 'reStartup');
  }

  upsertConfig() {
    const names = this.configs.map(c => c.name);
    if (names.includes(this.configName)) {
      this.$message.error('配置名称不能重复');
      return;
    }
    if (this.isEdit) {
      if (this.configs[this.current].name === this.activeConfig) {
        this.activeConfig = this.configName;
      }
      this.configs[this.current].name = this.configName;
    } else {
      this.configs.push({
        name: this.configName,
        serverAddress: '域名或ip',
        serverPort: 80,
        localAddress: '127.0.0.1',
        localPort: 1099,
        method: 'aes-256-cfb',
        password: 'password'
      });
    }
    this.save();
    this.isShowDialog = false;
  }
  removeConfig() {
    if (this.configs[this.current].name === this.activeConfig) {
      this.$message({
        message: '当前配置正在启用，不能删除！！',
        type: 'warning'
      });
      return false;
    }
    this.configs.splice(this.current, 1);
    this.current = this.current > 0 ? this.current - 1 : 0;
    this.save();
  }
  save() {
    this.$nextTick(() => {
      const { activeConfig, configs } = this;
      updateSetting({ activeConfig, configs });
      this.$message.success({
        message: '操作成功'
      });
    });
  }
}
</script>

<style src="./App.scss"></style>
