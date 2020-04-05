/* eslint-disable no-console */

import { register } from "register-service-worker";

export function registerServiceWorker(ebus) {
  register(`${process.env.BASE_URL}service-worker.js`, {
    ready(sw) {
      console.log(
        "App is being served from cache by a service worker.\n" +
          "For more details, visit https://goo.gl/AFskqB"
      );
    },
    registered(registration) {
      console.log("Service worker has been registered.");
      ebus.$emit("swregistered", registration);
    },
    cached() {
      console.log("Content has been cached for offline use.");
    },
    updatefound() {
      console.log("New content is downloading.");
    },
    updated() {
      ebus.$Toast.show({
        type: "info",
        text: "Page is updated; please refresh.",
      });
    },
    offline() {
      ebus.$emit("offline");
      ebus.$Toast.show({
        type: "warning",
        text: "No internet connection found.",
      });
    },
    error(error) {
      console.error("Error during service worker registration:", error);
    },
  });
}
