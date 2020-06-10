importScripts("precache-manifest.7cfd3910a5cfc5927ef0b481967489bc.js");

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
function postData(url, data) {
  // Default options are marked with *
  return fetch(url, {
    body: JSON.stringify(data), // must match 'Content-Type' header
    cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
    credentials: "same-origin", // include, same-origin, *omit
    headers: {
      "content-type": "application/json",
    },
    method: "POST", // *GET, POST, PUT, DELETE, etc.
    // mode: "cors", // no-cors, cors, *same-origin
    redirect: "follow", // manual, *follow, error
    referrer: "no-referrer", // *client, no-referrer
  }).then((response) => response.json()); // parses response to JSON
}
self.addEventListener("message", function(event) {
  const promise = new Promise(async (resolve, reject) => {
    const packet = event.data;
    switch (packet.cmd) {
      case "set-data":
        const storage = new IndexedDBStorage();
        await storage.open("config");
        for (let key in packet.data) {
          await storage.setItem(key, packet.data[key]);
        }
        break;
    }
    resolve();
  });
  event.waitUntil(promise);
});
self.addEventListener("push", function(e) {
  if (!e.data) {
    return;
  }

  // 解析获取推送消息
  let payload = e.data.json(); // MessageServerSocketPacket
  // 根据推送消息生成桌面通知并展现出来
  let promise = new Promise(async (resolve, reject) => {
    const list = await clients.matchAll();
    if (payload.cmd === "MESSAGE") {
      const storage = new IndexedDBStorage();
      await storage.open("config");
      await self.registration.showNotification(payload.data.message.text, {
        body: payload.data.message.desp,
        icon: "./img/icons/128.png",
        badge: "./img/icons/128.png",
        data: {
          scheme: payload.data.message.extra.scheme,
          inPage: list.length > 0,
          basehref: await storage.getItem("basehref"),
        },
      });
    }
    let httpurl = await storage.getItem("httpurl");
    let auth = await storage.getItem("auth");
    if (httpurl) {
      const res = await postData(httpurl, {
        cmd: "MESSAGE_FCM_CALLBACK",
        auth,
        data: {
          mid: payload.data.mid,
        },
      });
    }
    resolve();
  });
  e.waitUntil(promise);
});
self.addEventListener("notificationclick", function(e) {
  // 关闭通知
  e.notification.close();
  // 打开网页
  if (e.notification.data.scheme) {
    e.waitUntil(
      clients.openWindow(
        `${e.notification.data.basehref}?scheme=${encodeURI(
          e.notification.data.scheme
        )}`
      )
    );
  } else if (!e.notification.data.inPage) {
    e.waitUntil(clients.openWindow(e.notification.data.basehref));
  }
});

