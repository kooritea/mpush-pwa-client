import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    messages: []
  },
  mutations: {
    loadMessages(state, payload) {
      state.messages.push(payload.message);
    },
    putMessage(state, payload) {
      state.messages.unshift(payload.message);
    },
    deleteMessage(state, payload) {
      state.messages.splice(
        state.messages.indexOf(payload.message),
        1
      );
    }
  },
  actions: {},
  modules: {}
});
