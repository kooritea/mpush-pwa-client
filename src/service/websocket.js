export class MpushClient {
  constructor(config, ebus) {
    this.config = config;
    this.ebus = ebus;
    this.isAuth = false;
    this.isAuthError = false;
    this.isOffline = false;
    this.ws = null;
    this.registration = this.ebus.$registration;
    this.connect();
    this.ebus.$on("refreshConfig", (config) => {
      this.isAuthError = false;
      this.config = config;
      this.connect();
    });
    this.ebus.$on("offline", () => {
      this.isOffline = true;
    });
    setInterval(() => {
      this.send({
        cmd: "PING",
      });
    }, 30000);
  }

  connect() {
    if (
      !this.config.url ||
      !this.config.name ||
      this.isAuthError ||
      this.isOffline
    ) {
      return;
    }
    try {
      if (this.ws) {
        try {
          this.ws.close();
        } catch (e) {}
      }
      this.ws = new WebSocket(this.config.url);
      this.ws.onopen = () => {
        this.ws.send(
          JSON.stringify({
            cmd: "AUTH",
            data: {
              token: this.config.token,
              name: this.config.name,
              group: this.config.group,
            },
          })
        );
      };
      this.ws.onclose = () => {
        setTimeout(() => {
          this.connect();
        }, this.config.retryWait || 3000);
      };
      this.ws.onerror = () => {
        this.toast("error", `websocket连接失败`);
      };
      this.ws.onmessage = this.onmessage.bind(this);
    } catch (e) {
      this.toast("error", `websocket连接出错:${e.message}`);
    }
  }

  onmessage(originPacket) {
    const packet = this.decodePacket(originPacket.data);
    switch (packet.cmd) {
      case "AUTH":
        if (packet.data.code === 200) {
          this.isAuth = true;
          localStorage.setItem("auth", packet.data.auth);
          // this.ebus.$emit("worker-set-data", {
          //   key: "auth",
          //   value: packet.data.auth,
          // });
          // this.ebus.$emit("worker-set-data", {
          //   key: "token",
          //   value: this.config.token,
          // });
          // this.ebus.$emit("worker-set-data", {
          //   key: "httpurl",
          //   value: this.config.httpurl,
          // });
          this.toast("success", "websocket连接成功");
          this.registerFCM();
        } else {
          this.isAuthError = true;
          this.toast("error", packet.data.msg);
        }
        break;
      case "MESSAGE":
        this.send({
          cmd: "MESSAGE_CALLBACK",
          data: {
            mid: packet.data.mid,
          },
        });
        break;
      case "INFO":
        this.toast("info", packet.data);
    }
    this.ebus.$emit(packet.cmd, packet.data);
  }

  decodePacket(originPacket) {
    return JSON.parse(originPacket);
  }
  encodePacket(packet) {
    return JSON.stringify(packet);
  }
  send(packet) {
    this.ws.send(this.encodePacket(packet));
  }
  toast(type, text) {
    this.ebus.$Toast.show({
      type,
      text,
    });
  }
  async registerFCM() {
    try {
      if (window.PushManager == null || navigator.serviceWorker == null) {
        this.toast(
          "error",
          `当前浏览器不支持消息通知:${typeof window.PushManager} ${typeof navigator.serviceWorker}`
        );
        return;
      }

      let pushSubscription = await this.registration.pushManager.getSubscription();
      if (this.config.fcm) {
        this.ebus.$once("REGISTER_FCM", async (data) => {
          try {
            if (pushSubscription) {
              let oldKey = uint8ArrayToBase64(
                pushSubscription.options.applicationServerKey
              );
              let newKey =
                data.applicationServerKey
                  .replace(/-/g, "+")
                  .replace(/_/g, "/") + "=";
              if (oldKey === newKey) {
                return;
              } else {
                this.toast("info", "重新注册FCM");
                if (pushSubscription) {
                  await pushSubscription.unsubscribe();
                }
              }
            }
            const newPushSubscription = await this.registration.pushManager.subscribe(
              {
                userVisibleOnly: true,
                applicationServerKey: base64ToUint8Array(
                  data.applicationServerKey
                ),
              }
            );
            this.send({
              cmd: "REGISTER_FCM_2",
              data: newPushSubscription,
            });
          } catch (e) {
            this.toast("error", `注册FCM出错: ${e}`);
          }
        });
        this.send({
          cmd: "REGISTER_FCM",
        });
      } else {
        if (pushSubscription) {
          pushSubscription.unsubscribe();
        }
      }
    } catch (e) {
      this.toast("error", `注册FCM出错: ${e}`);
    }
  }
}

function base64ToUint8Array(base64String) {
  let padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  let rawData = atob(base64);
  let outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
function uint8ArrayToBase64(arr) {
  return btoa(String.fromCharCode.apply(null, new Uint8Array(arr)));
}
