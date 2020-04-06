class IndexedDBStorage {
  constructor() {
    this.name = null;
    this.db = null;
  }
  open(name) {
    this.name = name;
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(name, 1);

      request.onerror = (event) => {
        reject(event);
      };
      request.onsuccess = (event) => {
        const db = request.result;
        this.db = db;
        resolve();
      };
      request.onupgradeneeded = function (event) {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(name)) {
          let objectStore = db.createObjectStore(name, {
            keyPath: "key",
          });
          objectStore.createIndex("key", "key", { unique: true });
        }
        resolve();
      };
    });
  }
  setItem(key, value) {
    return new Promise(async (resolve, reject) => {
      let result;
      if (await this.getItem(key)) {
        result = this.db
          .transaction([this.name], "readwrite")
          .objectStore(this.name)
          .put({ key, value });
      } else {
        result = this.db
          .transaction([this.name], "readwrite")
          .objectStore(this.name)
          .add({ key, value });
      }
      result.onsuccess = function (event) {
        resolve();
      };

      result.onerror = function (event) {
        reject(event);
      };
    });
  }
  getItem(key) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.name]);
      const objectStore = transaction.objectStore(this.name);
      const request = objectStore.get(key);
      request.onerror = function (event) {
        reject();
      };
      request.onsuccess = function (event) {
        resolve(request.result ? request.result.value : undefined);
      };
    });
  }
}
