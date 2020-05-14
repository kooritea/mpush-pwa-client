import Vue from "vue";
import App from "./App.vue";
import { registerServiceWorker } from "./registerServiceWorker";
import router from "./router";
import store from "./store";
import levelup from "levelup";
import encode from "encoding-down";
import leveljs from "level-js";

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
      prefix: "",
    }),
    {
      valueEncoding: "json",
    }
  )
);
if (window.PushManager == null || navigator.serviceWorker == null) {
  new Vue({
    router,
    store,
    render: function(h) {
      return h(App);
    },
  }).$mount("#app");
} else {
  ebus.$on("swregistered", (registration) => {
    Vue.prototype.$registration = registration;
    new Vue({
      router,
      store,
      render: function(h) {
        return h(App);
      },
    }).$mount("#app");
  });
  registerServiceWorker(ebus);
}
