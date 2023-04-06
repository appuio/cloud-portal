import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class BrowserStorageService {
  storageAvailabilityCache: Map<string, boolean> = new Map();

  /**
   * Tests if the storage type is available in the current browser.
   * @param type the kind of storage.
   * @return true if storage is available and writable, false otherwise.
   */
  storageAvailable(type: 'localStorage' | 'sessionStorage'): boolean {
    if (this.storageAvailabilityCache.has(type)) {
      return this.storageAvailabilityCache.get(type) ?? false;
    }

    // Snippet based on
    // https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API#feature-detecting_localstorage
    let storage;
    try {
      storage = window[type];
      const x = '__storage_test__';
      storage.setItem(x, x);
      storage.removeItem(x);
      this.storageAvailabilityCache.set(type, true);
    } catch (e) {
      const available =
        (e instanceof DOMException &&
          // everything except Firefox
          (e.code === 22 ||
            // Firefox
            e.code === 1014 ||
            // test name field too, because code might not be present
            // everything except Firefox
            e.name === 'QuotaExceededError' ||
            // Firefox
            e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
          // acknowledge QuotaExceededError only if there's something already stored
          storage &&
          storage.length !== 0) ??
        false;
      this.storageAvailabilityCache.set(type, available);
    }
    return this.storageAvailabilityCache.get(type) ?? false;
  }

  /**
   * Stores the value under the given key.
   * @return true if the local storage is available and saved, otherwise false.
   */
  setLocalStorageItem(key: string, value: string): boolean {
    if (!this.storageAvailable('localStorage')) {
      return false;
    }
    window.localStorage.setItem(key, value);
    return true;
  }

  /**
   * Removes the element identified by key.
   * If local storage is not available or key not present, this is a no-op.
   */
  removeLocalStorageItem(key: string): void {
    if (!this.storageAvailable('localStorage')) {
      return;
    }
    window.localStorage.removeItem(key);
  }

  /**
   * Gets the value associated with the given key.
   * @return the string value, if present. `undefined` if not or storage is not available.
   */
  getLocalStorageItem(key: string): string | undefined {
    if (!this.storageAvailable('localStorage')) {
      return undefined;
    }
    const v = window.localStorage.getItem(key);
    return v ?? undefined;
  }
}
