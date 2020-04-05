module.exports = {
  outputDir: "dist",
  publicPath: "./",
  productionSourceMap: process.env.NODE_ENV === "production" ? false : true,
  pwa: {
    name: "mpush",
    short_name: "mpush",
    themeColor: "#ffffff",
    msTileColor: "#ffffff",
    workboxPluginMode: "InjectManifest",
    workboxOptions: {
      swSrc: "src/service-worker.js",
    },
    iconPaths: {
      favicon32: "img/icons/128.png",
      favicon16: "img/icons/128.png",
      appleTouchIcon: "img/icons/192.png",
      msTileImage: "img/icons/144.png",
    },
  },
};
