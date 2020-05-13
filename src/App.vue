<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
import { MpushClient } from "./service/websocket";
export default {
  name: "App",
  methods: {
    createMpushClient() {
      new MpushClient(
        {
          url: localStorage.getItem("url") || "",
          token: localStorage.getItem("token") || "",
          name: localStorage.getItem("name") || "",
          group: localStorage.getItem("group") || "",
          fcm: localStorage.getItem("fcm") === "true",
          httpurl: localStorage.getItem("httpurl") || ""
        },
        this.$ebus
      );
    }
  },
  async created() {
    const messages = [];
    this.$messagesdb
      .createReadStream()
      .on("data", data => {
        messages.push(data.value);
      })
      .on("end", () => {
        this.$store.commit({
          type: "initMessages",
          messages: messages.reverse()
        });
        this.createMpushClient();
      });
    this.$ebus.$on("MESSAGE", packet => {
      if (
        !this.$store.state.messages[0] ||
        (this.$store.state.messages[0] &&
          packet.mid !== this.$store.state.messages[0].mid)
      ) {
        this.$messagesdb.put(packet.mid, packet);
        this.$store.commit({
          type: "putMessage",
          message: packet
        });
      }
    });
    this.$ebus.$on("worker-set-data", packet => {
      navigator.serviceWorker.controller &&
        navigator.serviceWorker.controller.postMessage({
          cmd: "set-data",
          data: packet
        });
    });
  }
};
</script>

<style lang="scss">
.zi-toast {
  max-width: calc(100vw - 5rem);
  .message {
    max-width: unset !important;
  }
}
.zi-toast-area:hover {
  .zi-toast-container:nth-last-child(2) {
    animation: unset;
    transform: translate3d(0, -80px, 0) scale(1);
  }
  .zi-toast-container:nth-last-child(3) {
    animation: unset;
    transform: translate3d(0, -160px, 0) scale(1);
  }
  .zi-toast-container:nth-last-child(4) {
    animation: unset;
    transform: translate3d(0, -240px, 0) scale(1);
  }
}
</style>
