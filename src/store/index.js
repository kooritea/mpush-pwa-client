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
      this.state.messages.push(payload.message);
    }
  },
  actions: {},
  modules: {}
});
