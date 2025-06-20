/**
 * App Storage class
 * @description This will be responsible for storing data into the application.
 * Commonly, people use LocalStorage or SessionStorage. This is just a wrapper over them
 * because to restrict the usage of Global window storage throughout the application
 * Default, this is just using the LocalStorage
 */

interface StorageItem {
  value: any;
  expiry: number;
}

interface CustomStorage {
  set(key: string, value: any): void;
  get(key: string): any;
  remove(key: string): void;
  clear(): void;
}

type StorageType = "local" | "custom";

export class AppStorage {
  private storage: Storage | CustomStorage;
  private type: StorageType;

  constructor(storage?: Storage | CustomStorage, type?: StorageType) {
    this.storage = storage || window.localStorage;
    this.type = type || "local";

    /** Is storage is supported or not */
    if (!this.isSupported()) {
      throw new Error("Storage is not supported by browser!");
    }
  }

  setItem<T>(key: string, value: T): void {
    if (this.type === "local") {
      (this.storage as Storage).setItem(key, JSON.stringify(value));
    } else {
      (this.storage as CustomStorage).set(key, value);
    }
  }

  getItem<T>(key: string): T | null {
    if (this.type === "local") {
      const item = (this.storage as Storage).getItem(key);
      return item ? JSON.parse(item) : null;
    } else {
      return (this.storage as CustomStorage).get(key);
    }
  }

  removeItem(key: string): void {
    if (this.type === "local") {
      (this.storage as Storage).removeItem(key);
    } else {
      (this.storage as CustomStorage).remove(key);
    }
  }

  setWithExpiry<T>(key: string, value: T, ttl: number): void {
    const now = new Date();

    const item: StorageItem = {
      value: value,
      expiry: now.getTime() + ttl,
    };

    this.setItem(key, item);
  }

  getWithExpiry<T>(key: string): T | null {
    const itemStr = this.getItem<StorageItem | string>(key);
    if (!itemStr) {
      return null;
    }

    let item: StorageItem = itemStr as StorageItem;
    try {
      if (typeof itemStr === "string") {
        item = JSON.parse(itemStr);
      }

      const now = new Date();

      if (now.getTime() > item.expiry) {
        this.removeItem(key);
        return null;
      }
      return item.value;
    } catch {
      return itemStr as T;
    }
  }

  removeBulkItems(keys: string[]): void {
    for (const key of keys) {
      this.removeItem(key);
    }
  }

  clear(): void {
    this.storage.clear();
  }

  /**
   * @description Check for storage support
   * @returns {boolean} supported
   * */
  isSupported(): boolean {
    let supported = true;

    if (!this.storage) {
      supported = false;
    }

    return supported;
  }
}

/**
 * Creating the instance of storage. Default will be localStorage
 * but if you want to create instance for session storage then pass window.sessionStorage as parameter
 */
const appLocalStorage = new AppStorage();
const appSessionStorage = new AppStorage(window.sessionStorage);
export { appLocalStorage, appSessionStorage };
