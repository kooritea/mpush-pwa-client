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
</style>
