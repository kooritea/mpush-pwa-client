import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    messages: []
  },
  mutations: {
    initMessages(state, payload) {
      this.state.messages = payload.messages;
    },
    putMessage(state, payload) {
      this.state.messages.unshift(payload.message);
    },
    deleteMessage(state, payload) {
      this.state.messages.splice(
        this.state.messages.indexOf(payload.message),
        1
      );
    }
  },
  actions: {},
  modules: {}
});
