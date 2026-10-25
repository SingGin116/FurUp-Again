



let avatarCacheInstance = null;

const AVATAR_PLACEHOLDER_COLORS = [
  '#7F77DD', '#1D9E75', '#D85A30', '#D4537E',
  '#378ADD', '#639922', '#BA7517', '#5F5E5A',
];

function escapeXmlText(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function buildAvatarPlaceholder(account) {
  const rawLabel = String(account.name || account.uid || '?').trim();
  const label = escapeXmlText(Array.from(rawLabel)[0] || '?');
  const seed = String(account.uid || '0');
  let hash = 7;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  const color = AVATAR_PLACEHOLDER_COLORS[hash % AVATAR_PLACEHOLDER_COLORS.length];
  const svg =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80">' +
    `<rect width="80" height="80" fill="${color}"/>` +
    '<text x="40" y="40" dy="0.35em" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif"' +
    ` font-size="34" font-weight="500" fill="#ffffff">${label}</text>` +
    '</svg>';
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export const avatarMixin = {
  data() {
    return {
      avatarUrls: {}, 
      avatarLoading: new Set(), 
    };
  },

  methods: {
    


    async getAvatarCache() {
      if (!avatarCacheInstance) {
        try {
          const module = await import('../utils/avatarCache.js');
          avatarCacheInstance = module.avatarCache;
        } catch (error) {
          console.warn('Failed to load avatar cache:', error);
          return null;
        }
      }
      return avatarCacheInstance;
    },

    




    // B 站 CDN 对无处理参数的原图有额外校验（Sec-Fetch 等），浏览器直接加载会 403；
    // 追加官方缩放参数走图片处理通道即可放行，144px 对头像场景足够且省约 90% 流量
    normalizeAvatarUrl(url) {
      if (!url || !url.includes('hdslb.com/bfs/face/')) return url;
      if (url.includes('@')) return url; // 已带处理参数
      return `${url}@144w_144h.webp`;
    },

    // 头像加载失败（如 UP 主换头像导致旧链接 404）时，兜底显示首字占位图
    onAvatarError(e, account) {
      const el = e && e.target;
      if (!el || el.dataset.fb) return;
      el.dataset.fb = '1';
      el.src = buildAvatarPlaceholder(account || {});
    },

    getAvatarUrl(account) {
      if (!account || !account.uid) return '';

      const raw = account.avatar || buildAvatarPlaceholder(account);
      return this.normalizeAvatarUrl(raw);
    },

    


    async loadAvatarAsync(account) {
      if (!account || !account.uid || !account.avatar) return;

      this.avatarLoading.add(account.uid);

      try {
        const cache = await this.getAvatarCache();
        if (!cache) {
          
          return;
        }

        const blobUrl = await cache.getAvatar(
          account.uid,
          account.avatar,
          account.lastUpdated || ''
        );

        
        this.$set(this.avatarUrls, account.uid, blobUrl);
      } catch (error) {
        console.warn(`Failed to load avatar for ${account.uid}:`, error);
      } finally {
        this.avatarLoading.delete(account.uid);
      }
    },

    


    async batchLoadAvatars(accounts, batchSize = 10) {
      if (!accounts || accounts.length === 0) return;

      const cache = await this.getAvatarCache();
      if (!cache) return;

      
      for (let i = 0; i < accounts.length; i += batchSize) {
        const batch = accounts.slice(i, i + batchSize);

        await Promise.all(
          batch.map(account => this.loadAvatarAsync(account))
        );

        
        if (i + batchSize < accounts.length) {
          await new Promise(resolve => setTimeout(resolve, 50));
        }
      }
    },

    


    async clearAvatarCache() {
      const cache = await this.getAvatarCache();
      if (cache) {
        await cache.clearAll();
        this.avatarUrls = {};
        console.log('Avatar cache cleared');
      }
    },

    


    async getAvatarCacheStats() {
      const cache = await this.getAvatarCache();
      if (cache) {
        return await cache.getStats();
      }
      return null;
    },
  },

  computed: {
    


    accountsWithCachedAvatars() {
      if (!this.pagedAccounts) return [];

      return this.pagedAccounts.map(account => ({
        ...account,
        cachedAvatar: this.getAvatarUrl(account),
      }));
    },
  },

  watch: {
    


    pagedAccounts(newAccounts) {
      
      
    },
  },

  beforeUnmount() {
    
    Object.values(this.avatarUrls).forEach(url => {
      if (url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
    });
  },
};
