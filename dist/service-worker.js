importScripts("precache-manifest.e9b04250c628a9afaee6edb19394f373.js");

importScripts(
  "https://cdn.jsdelivr.net/npm/workbox-sw@4.3.1/build/workbox-sw.min.js",
  "./IndexeddbStorage.js"
);
if (workbox) {
  console.log(`Yay! Workbox is loaded!`);
} else {
  console.log(`Boo! Workbox didn't load!`);
}

// 设置缓存前缀和后缀，请根据实际项目名修改
workbox.core.setCacheNameDetails({
  prefix: "mpush-pwa.client",
  suffix: "v1.0.0",
});

// have our sw update and control a web page as soon as possible.
workbox.core.skipWaiting(); // 强制等待中的 Service Worker 被激活
workbox.core.clientsClaim(); // Service Worker 被激活后使其立即获得页面控制权

// vue-cli3.0 supports pwa with the help of workbox-webpack-plugin, we need to get the precacheing list through this sentence.
workbox.precaching.precacheAndRoute(self.__precacheManifest || []);

workbox.routing.registerRoute(
  // Cache HTML files
  /.*\.html/,
  // 使用缓存，但尽快在后台更新
  workbox.strategies.staleWhileRevalidate({
    // 使用自定义缓存名称
    cacheName: "html-cache",
  })
);

workbox.routing.registerRoute(
  // Cache CSS files
  /.*\.css/,
  // 使用缓存，但尽快在后台更新
  workbox.strategies.staleWhileRevalidate({
    // 使用自定义缓存名称
    cacheName: "css-cache",
  })
);
workbox.routing.registerRoute(
  // 缓存JS文件
  /.*\.js/,
  // 使用缓存，但尽快在后台更新
  workbox.strategies.staleWhileRevalidate({
    // 使用自定义缓存名称
    cacheName: "js-cache",
  })
);

workbox.routing.registerRoute(
  /\.(?:png|gif|jpg|jpeg|svg)$/,
  workbox.strategies.staleWhileRevalidate({
    cacheName: "images",
    plugins: [
      new workbox.expiration.Plugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
      }),
    ],
  })
);
function ajax({ method, url, data, headers }) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, url);
    if (headers) {
      for (let header in headers) {
        xhr.setRequestHeader(header, headers[header]);
      }
    }
    xhr.responseType = "json";
    xhr.onreadystatechange = () => {
      if (this.readyState == 4 && this.status >= 200 && this.status < 300) {
        resolve(xhr.response);
      } else {
        reject({
          code: this.status,
          text: this.responseText,
        });
      }
    };
    xhr.send(JSON.stringify(data));
  });
}
self.addEventListener("message", function(event) {
  const promise = new Promise(async (resolve, reject) => {
    const packet = event.data;
    switch (packet.cmd) {
      case "set-data":
        const storage = new IndexedDBStorage();
        await storage.open("config");
        await storage.setItem(packet.data.key, packet.data.value);
        break;
    }
    resolve();
  });
  event.waitUntil(promise);
});
self.addEventListener("push", function(e) {
  console.log(e);
  if (!e.data) {
    return;
  }

  // 解析获取推送消息
  let payload = e.data.json(); // MessageServerSocketPacket
  // 根据推送消息生成桌面通知并展现出来
  let promise = new Promise(async (resolve, reject) => {
    const list = await clients.matchAll();
    if (payload.cmd === "MESSAGE") {
      await self.registration.showNotification(payload.data.message.text, {
        body: payload.data.message.desp,
        icon: "./img/icons/128.png",
        badge: "./img/icons/128.png",
        data: {
          url: "./",
          scheme: payload.data.message.extra.scheme,
          inPage: list.length > 0,
        },
      });
    }
  });
  e.waitUntil(promise);
});
self.addEventListener("notificationclick", function(e) {
  // 关闭通知
  e.notification.close();
  // 打开网页
  if (e.notification.data.scheme) {
    e.waitUntil(clients.openWindow(e.notification.data.scheme));
  } else if (!e.notification.data.inPage) {
    e.waitUntil(clients.openWindow(e.notification.data.url));
  }
});

