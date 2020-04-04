import Vue from "vue";
import App from "./App.vue";
import "./registerServiceWorker";
import router from "./router";
import store from "./store";
import levelup from "levelup";
import encode from "encoding-down";
import leveljs from "level-js";
import { MpushClient } from "./service/websocket";
import "./extra";
import ZeitUI from "@zeit-ui/vue";
import "@zeit-ui/vue/dist/zeit-ui.css";
import "@zeit-ui/themes/index.css";
import "@zeit-ui/themes/dark.css";
import { install } from "@zeit-ui/vue-icons";
Vue.use(ZeitUI);
install(Vue);

const ebus = new Vue();

Vue.config.productionTip = false;
Vue.prototype.$ebus = ebus;
Vue.prototype.$messagesdb = levelup(
  encode(
    leveljs("messages", {
      prefix: ""
    }),
    {
      valueEncoding: "json"
    }
  )
);
Vue.prototype.$mpushClient = new MpushClient(
  {
    url: localStorage.getItem("url") || "",
    token: localStorage.getItem("token") || "",
    name: localStorage.getItem("name") || "",
    group: localStorage.getItem("group") || "",
    fcm: localStorage.getItem("fcm") === "true"
  },
  ebus
);

new Vue({
  router,
  store,
  render: function(h) {
    return h(App);
  }
}).$mount("#app");
