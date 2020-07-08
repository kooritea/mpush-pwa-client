import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    messages: [],
    offset: 0
  },
  mutations: {
    loadMessages(state, payload) {
      state.messages.splice(state.offset, 0, payload.message);
    },
    putMessage(state, payload) {
      state.messages.unshift(payload.message);
      state.offset++
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
