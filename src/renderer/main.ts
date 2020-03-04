import Vue from 'vue';
import ElementUi from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import App from './demo.vue';

Vue.use(ElementUi, {
	size: 'small'
});

Vue.config.productionTip = false;

new Vue({
	render: (h) => h(App)
}).$mount('#app');
