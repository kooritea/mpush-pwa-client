import Vue from "vue";
import VueRouter from "vue-router";
import Home from "../views/Home.vue";
import Setting from "../views/Settings.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home
  },
  {
    path: "/settings",
    name: "Settings",
    component: Setting
  }
];

const router = new VueRouter({
  routes
});

export default router;
