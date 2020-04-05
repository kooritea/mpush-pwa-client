<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
export default {
  name: "App",
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
      });
    this.$ebus.$on("MESSAGE", packet => {
      this.$messagesdb.put(packet.mid, packet);
      this.$store.commit({
        type: "putMessage",
        message: packet
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
