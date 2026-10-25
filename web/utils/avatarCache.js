




const DB_NAME = 'FurUpAvatarCache';
const DB_VERSION = 1;
const STORE_NAME = 'avatars';

class AvatarCache {
  constructor() {
    this.db = null;
    this.initPromise = this.init();
  }

  


  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const objectStore = db.createObjectStore(STORE_NAME, { keyPath: 'uid' });
          objectStore.createIndex('lastUpdated', 'lastUpdated', { unique: false });
        }
      };
    });
  }

  






  async getAvatar(uid, avatarUrl, lastUpdated) {
    await this.initPromise;

    try {
      
      const cached = await this.getCachedAvatar(uid);

      if (cached && cached.lastUpdated === lastUpdated) {
        
        return cached.blobUrl;
      }

      
      const blob = await this.downloadAvatar(avatarUrl);
      const blobUrl = URL.createObjectURL(blob);

      
      await this.saveAvatar(uid, blob, lastUpdated);

      
      if (cached && cached.blobUrl) {
        URL.revokeObjectURL(cached.blobUrl);
      }

      return blobUrl;
    } catch (error) {
      console.error(`Failed to load avatar for ${uid}:`, error);
      
      return avatarUrl;
    }
  }

  


  async getCachedAvatar(uid) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readonly');
      const objectStore = transaction.objectStore(STORE_NAME);
      const request = objectStore.get(uid);

      request.onsuccess = () => {
        const result = request.result;
        if (result) {
          
          const blobUrl = URL.createObjectURL(result.blob);
          resolve({ ...result, blobUrl });
        } else {
          resolve(null);
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  


  async downloadAvatar(url) {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to download avatar: ${response.statusText}`);
    }
    return await response.blob();
  }

  


  async saveAvatar(uid, blob, lastUpdated) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readwrite');
      const objectStore = transaction.objectStore(STORE_NAME);

      const data = {
        uid,
        blob,
        lastUpdated,
        cachedAt: new Date().toISOString()
      };

      const request = objectStore.put(data);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  


  async clearAvatar(uid) {
    await this.initPromise;
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readwrite');
      const objectStore = transaction.objectStore(STORE_NAME);
      const request = objectStore.delete(uid);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  


  async clearAll() {
    await this.initPromise;
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readwrite');
      const objectStore = transaction.objectStore(STORE_NAME);
      const request = objectStore.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  


  async getStats() {
    await this.initPromise;
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readonly');
      const objectStore = transaction.objectStore(STORE_NAME);
      const countRequest = objectStore.count();

      countRequest.onsuccess = () => {
        resolve({
          count: countRequest.result,
          dbName: DB_NAME,
          version: DB_VERSION
        });
      };

      countRequest.onerror = () => reject(countRequest.error);
    });
  }

  




  async preloadAvatars(users, batchSize = 5) {
    await this.initPromise;

    for (let i = 0; i < users.length; i += batchSize) {
      const batch = users.slice(i, i + batchSize);
      await Promise.all(
        batch.map(user =>
          this.getAvatar(user.uid, user.avatar, user.lastUpdated)
            .catch(err => console.warn(`Preload failed for ${user.uid}:`, err))
        )
      );
    }
  }
}


export const avatarCache = new AvatarCache();
