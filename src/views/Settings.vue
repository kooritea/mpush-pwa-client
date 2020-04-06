<template>
  <div class="settings">
    <div class="nav">
      <router-link to="/">
        <arrowLeft class="arrowLeft" />
      </router-link>
    </div>
    <div class="handles">
      <zi-row>
        <zi-input class="input-handle" v-model="url" prefix-label="WebsocketURL"></zi-input>
      </zi-row>
      <zi-row>
        <zi-input class="input-handle" v-model="token" prefix-label="Token"></zi-input>
      </zi-row>
      <zi-row>
        <zi-input class="input-handle" v-model="name" prefix-label="Name"></zi-input>
      </zi-row>
      <zi-row>
        <zi-input class="input-handle" v-model="group" prefix-label="Group"></zi-input>
      </zi-row>

      <zi-row>
        FCM推送
        <zi-toggle v-model="fcm"></zi-toggle>
      </zi-row>
      <!-- <zi-row v-if="fcm">
        <zi-input class="input-handle" v-model="httpurl" prefix-label="HttpURL"></zi-input>
      </zi-row>-->
      <zi-button class="save" @click="save()" shadow type="success">应用</zi-button>
    </div>
  </div>
</template>
<script>
import arrowLeft from "@zeit-ui/vue-icons/packages/arrow-left";
export default {
  name: "Settings",
  components: { arrowLeft },
  data() {
    return {
      url: "",
      token: "",
      name: "",
      group: "",
      fcm: false,
      httpurl: ""
    };
  },
  methods: {
    save() {
      if (this.url && this.name) {
        localStorage.setItem("url", this.url);
        localStorage.setItem("token", this.token);
        localStorage.setItem("name", this.name);
        localStorage.setItem("group", this.group);
        localStorage.setItem("fcm", this.fcm ? "true" : "false");
        localStorage.setItem("httpurl", this.httpurl);
        this.$Toast.show({
          type: "success",
          text: `保存成功`
        });
        this.$ebus.$emit("refreshConfig", {
          url: this.url,
          token: this.token,
          name: this.name,
          group: this.group,
          fcm: this.fcm,
          httpurl: this.httpurl
        });
      } else {
        this.$Toast.show({
          type: "error",
          text: `[${this.url ? "name" : "url"}]不能为空`
        });
      }
    }
  },
  created() {
    this.url = localStorage.getItem("url") || "";
    this.token = localStorage.getItem("token") || "";
    this.name = localStorage.getItem("name") || "";
    this.group = localStorage.getItem("group") || "";
    this.fcm = localStorage.getItem("fcm") === "true";
  }
};
</script>
<style lang="scss" scoped>
.nav {
  margin: 10px 20px;
  position: relative;
  height: 37px;
  .arrowLeft {
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    cursor: pointer;
  }
}
.handles {
  margin: 0 20px;
  .zi-row {
    align-items: center;
    margin-bottom: 10px;
  }
  .input-handle {
    width: 100%;
    max-width: 500px;
  }
}
.save {
  width: calc(100% - 2.7rem);
  max-width: 500px;
}
</style>