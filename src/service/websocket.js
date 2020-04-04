export class MpushClient {
  constructor(config, ebus) {
    this.config = config;
    this.ebus = ebus;
    this.isAuth = false;
    this.isAuthError = false;
    this.ws = null;

    this.connect();
    this.ebus.$on("refreshConfig", config => {
      this.isAuthError = false;
      this.config = config;
      this.connect();
    });
  }

  connect() {
    if (!this.config.url || !this.config.name || this.isAuthError) {
      return;
    }
    try {
      this.ws = new WebSocket(this.config.url);
      this.ws.onopen = () => {
        this.ws.send(
          JSON.stringify({
            cmd: "AUTH",
            data: {
              token: this.config.token,
              name: this.config.name,
              group: this.config.group
            }
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
            mid: packet.data.mid
          }
        });
        break;
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
      text
    });
  }
  registerFCM() {
    if (this.config.fcm) {
    } else {
    }
  }
}
