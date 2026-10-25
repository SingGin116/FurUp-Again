import { loadSecureData } from "../utils/dataLoader.js";
import { copyToClipboard } from "../utils/helpers.js";
import { COPY_FEEDBACK_DELAY, COPY_RESET_DELAY, PASTEL_GRADIENTS, DEFAULT_PRIORITY } from "../utils/constants.js";

export const thanksMixin = {
  data() {
    return {
      thanksStatus: "ready",
      thanks: [],
      thanksLastUpdated: null,
      thanksSearchQuery: "",
      selectedThanksPlatform: "All",
      loadingThanks: false,
      thanksCopiedId: null,
      thanksCopiedAt: 0,
      thanksError: null,
      thanksGradients: PASTEL_GRADIENTS,
      
      thanksSubModule: "thanks", 
      friendLinks: [],
      loadingLinks: false,
      linksError: null,
    };
  },
  computed: {
    thanksTitle() {
      return this.strings.thanksTabThanks || this.strings.buttonThanks;
    },
    linksTitle() {
      if (this.strings.thanksTabLinks) return this.strings.thanksTabLinks;
      if (this.locale === "ja-JP") return "リンク";
      if (this.locale === "zh-CN" || this.locale === "zh-Hant") return "友链";
      return "Links";
    },
    thanksPlatforms() {
      const all = ["All"];
      const unique = [...new Set((this.thanks || []).map((t) => t.platform).filter(Boolean))];
      return [...all, ...unique.sort()];
    },
    thanksPlatformLabels() {
      const key = (this.locale === "zh-CN" || this.locale === "zh-Hant") ? "zh-CN" : this.locale === "ja-JP" ? "ja-JP" : "en-US";
      const maps = {
        "zh-CN": {
          All: "全部",
          qq: "QQ",
          wechat: "微信",
          xiaohongshu: "小红书",
          bilibili: "B站",
          douyin: "抖音",
          x: "X",
          youtube: "YouTube",
          other: "其他",
        },
        "en-US": {
          All: "All",
          qq: "QQ",
          wechat: "WeChat",
          xiaohongshu: "Xiaohongshu",
          bilibili: "Bilibili",
          douyin: "Douyin",
          x: "X",
          youtube: "YouTube",
          other: "Other",
        },
        "ja-JP": {
          All: "すべて",
          qq: "QQ",
          wechat: "WeChat",
          xiaohongshu: "RED",
          bilibili: "bilibili",
          douyin: "Douyin",
          x: "X",
          youtube: "YouTube",
          other: "その他",
        },
      };

      return maps[key];
    },
    filteredThanks() {
      let list = Array.isArray(this.thanks) ? [...this.thanks] : [];

      if (this.selectedThanksPlatform !== "All") {
        list = list.filter((t) => t.platform === this.selectedThanksPlatform);
      }

      const query = (this.thanksSearchQuery || "").trim().toLowerCase();
      if (query) {
        list = list.filter((t) => {
          return (
            String(t.name || "").toLowerCase().includes(query) ||
            String(t.handle || "").toLowerCase().includes(query) ||
            String(t.platform || "").toLowerCase().includes(query)
          );
        });
      }

      list.sort((a, b) => {
        const pa = a.priority !== undefined && a.priority !== null ? a.priority : DEFAULT_PRIORITY;
        const pb = b.priority !== undefined && b.priority !== null ? b.priority : DEFAULT_PRIORITY;
        return pa - pb;
      });

      return list;
    },
    filteredLinks() {
      let list = Array.isArray(this.friendLinks) ? [...this.friendLinks] : [];

      const query = (this.thanksSearchQuery || "").trim().toLowerCase();
      if (query) {
        list = list.filter((link) => {
          return (
            String(link.name || "").toLowerCase().includes(query) ||
            String(link.url || "").toLowerCase().includes(query)
          );
        });
      }

      
      list.sort((a, b) => {
        const pa = a.priority !== undefined && a.priority !== null ? a.priority : DEFAULT_PRIORITY;
        const pb = b.priority !== undefined && b.priority !== null ? b.priority : DEFAULT_PRIORITY;
        return pa - pb;
      });

      return list;
    },
  },
  methods: {
    async loadThanks() {
      if (this.loadingThanks) return;
      this.loadingThanks = true;
      try {
        const data = await loadSecureData("./data/thanks.json", { cache: "no-store" });
        this.thanksLastUpdated = data.meta?.lastUpdated || null;
        this.thanks = Array.isArray(data.thanks) ? data.thanks : [];
      } catch (error) {
        console.warn("Could not load thanks:", error);
        this.thanksError = error.message;
        this.thanks = [];
      } finally {
        this.loadingThanks = false;
      }
    },
    async loadFriendLinks() {
      if (this.loadingLinks) return;
      this.loadingLinks = true;
      try {
        const data = await loadSecureData("./data/links.json", { cache: "no-store" });
        this.friendLinks = Array.isArray(data.links) ? data.links : [];
      } catch (error) {
        console.warn("Could not load friend links:", error);
        this.linksError = error.message;
        this.friendLinks = [];
      } finally {
        this.loadingLinks = false;
      }
    },
    switchThanksSubModule(sub) {
      this.thanksSubModule = sub;
      if (sub === "links" && this.friendLinks.length === 0 && !this.loadingLinks) {
        this.loadFriendLinks();
      }
    },
    getThanksGradient(item) {
      const str = item?.id || item?.name || "";
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
      }
      const index = Math.abs(hash) % this.thanksGradients.length;
      return this.thanksGradients[index];
    },
    getLinkGradient(item) {
      const str = item?.id || item?.name || "";
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
      }
      const index = Math.abs(hash) % this.thanksGradients.length;
      return this.thanksGradients[index];
    },
    getLinkColorName(item) {
      const gradient = this.getLinkGradient(item); 
      
      const firstPart = gradient.split(' ')[0]; 
      return firstPart.replace('from-', '').replace('-200', '');
    },
    getLinkColorHex(item) {
      
      const name = this.getLinkColorName(item);
      const colors = {
        pink: '#ec4899',
        purple: '#a855f7',
        blue: '#3b82f6',
        cyan: '#06b6d4',
        teal: '#14b8a6',
        green: '#22c55e',
        lime: '#84cc16',
        yellow: '#eab308',
        orange: '#f97316',
        red: '#ef4444',
        indigo: '#6366f1',
        violet: '#8b5cf6',
        fuchsia: '#d946ef',
        rose: '#f43f5e',
        sky: '#0ea5e9',
        slate: '#64748b',
        gray: '#6b7280',
      };
      return colors[name] || '#3b82f6';
    },
    getThanksPlatformDisplay(item) {
      const key = item?.platform || "other";
      const label = this.thanksPlatformLabels[key] || key;
      return { label };
    },
    getThanksActionLabel(item) {
      const hasUrl = Boolean(item?.url);
      const hasHandle = Boolean(item?.handle);
      if (hasUrl) {
        
        return this.getThanksPlatformDisplay(item).label;
      }
      if (hasHandle) {
        if (this.locale === "zh-CN" || this.locale === "zh-Hant") return "点击复制";
        if (this.locale === "ja-JP") return "コピー";
        return "Copy";
      }
      if (this.locale === "zh-CN" || this.locale === "zh-Hant") return "查看";
      if (this.locale === "ja-JP") return "見る";
      return "View";
    },
    async openThanksItem(item) {
      const url = String(item?.url || "").trim();
      if (url) {
        if (/^https?:\/\//i.test(url)) {
          this.openExternal(url);
        }
        return;
      }
      const handle = String(item?.handle || "").trim();
      if (handle) {
        const ok = await copyToClipboard(handle);
        if (!ok) return;
        this.thanksCopiedId = item.id;
        this.thanksCopiedAt = Date.now();
        window.setTimeout(() => {
          if (this.thanksCopiedId === item.id && Date.now() - this.thanksCopiedAt >= COPY_FEEDBACK_DELAY) {
            this.thanksCopiedId = null;
          }
        }, COPY_RESET_DELAY);
      }
    },
    openLinkItem(item) {
      const url = String(item?.url || "").trim();
      if (url && /^https?:\/\//i.test(url)) {
        this.openExternal(url);
      }
    },
  },
  watch: {
    activeModule(newVal) {
      if (newVal === "thanks" && !this.loadingThanks) this.loadThanks();
    },
  },
  mounted() {
    const handler = () => {
      if (document.hidden) return;
      if (this.activeModule === "thanks" && !this.loadingThanks) {
        this.loadThanks();
      }
    };
    this._thanksVisibilityHandler = handler;
    document.addEventListener("visibilitychange", handler);
    if (this.activeModule === "thanks") {
      this.loadThanks();
    }
  },
  beforeUnmount() {
    if (this._thanksVisibilityHandler) {
      document.removeEventListener("visibilitychange", this._thanksVisibilityHandler);
      this._thanksVisibilityHandler = null;
    }
  },
};
