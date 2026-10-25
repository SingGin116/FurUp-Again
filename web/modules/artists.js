import { loadSecureData } from "../utils/dataLoader.js";
import { copyToClipboard } from "../utils/helpers.js";
import { COPY_FEEDBACK_DELAY, COPY_RESET_DELAY, PASTEL_GRADIENTS, DEFAULT_PRIORITY } from "../utils/constants.js";

export const artistsMixin = {
  data() {
    return {
      artistsStatus: "ready",
      artists: [],
      artistsLastUpdated: null,
      artistsSearchQuery: "",
      selectedArtistPlatform: "All",
      selectedCreatorType: "全部",
      loadingArtists: false,
      artistsCopiedId: null,
      artistsCopiedAt: 0,
      artistsError: null,
      artistsGradients: PASTEL_GRADIENTS,
    };
  },
  computed: {
    artistsTitle() {
      return this.strings.buttonArtists;
    },
    artistsPlatforms() {
      const all = ["All"];
      const unique = [...new Set((this.artists || []).map((a) => a.platform).filter(Boolean))];
      return [...all, ...unique.sort()];
    },
    artistsPlatformLabels() {
      const key = (this.locale === "zh-CN" || this.locale === "zh-Hant") ? "zh-CN" : this.locale === "ja-JP" ? "ja-JP" : "en-US";
      const maps = {
        "zh-CN": {
          All: "全部",
          xianyu: "闲鱼",
          mihuashi: "米画师",
          bilibili_workshop: "B站工坊",
          taobao: "淘宝",
          bilibili: "B站",
          xiaohongshu: "小红书",
          douyin: "抖音",
          x: "X",
        },
        "en-US": {
          All: "All",
          xianyu: "Xianyu",
          mihuashi: "Mihuashi",
          bilibili_workshop: "Bilibili Workshop",
          taobao: "Taobao",
          bilibili: "Bilibili",
          xiaohongshu: "Xiaohongshu",
          douyin: "Douyin",
          x: "X",
        },
        "ja-JP": {
          All: "すべて",
          xianyu: "Xianyu",
          mihuashi: "Mihuashi",
          bilibili_workshop: "Bilibili 工房",
          taobao: "Taobao",
          bilibili: "bilibili",
          xiaohongshu: "RED",
          douyin: "Douyin",
          x: "X",
        },
      };

      return maps[key];
    },
    creatorTypeLabels() {
      return {
        "全部": this.strings.creatorTypeAll || "全部",
        "画师": this.strings.creatorTypeArtist || "画师",
        "建模": this.strings.creatorTypeModeling || "建模",
        "曲师": this.strings.creatorTypeComposer || "曲师",
        "开发": this.strings.creatorTypeDev || "开发",
        "摄影": this.strings.creatorTypePhoto || "摄影",
        "作家": this.strings.creatorTypeWriter || "作家",
        "其他": this.strings.creatorTypeOther || "其他",
      };
    },
    filteredArtists() {
      let list = Array.isArray(this.artists) ? [...this.artists] : [];
      if (this.selectedCreatorType !== "全部") {
        list = list.filter((a) => (a.creator_type || "画师") === this.selectedCreatorType);
      }
      if (this.selectedArtistPlatform !== "All") {
        list = list.filter((a) => a.platform === this.selectedArtistPlatform);
      }
      const query = (this.artistsSearchQuery || "").trim().toLowerCase();
      if (query) {
        list = list.filter((a) => {
          return (
            String(a.name || "").toLowerCase().includes(query) ||
            String(a.note || "").toLowerCase().includes(query) ||
            String(a.platform || "").toLowerCase().includes(query) ||
            String(a.qq_group || "").toLowerCase().includes(query)
          );
        });
      }

      // 随机排序
      list.sort(() => Math.random() - 0.5);

      return list;
    },
  },
  methods: {
    cycleCreatorType() {
      const types = ["全部", "画师", "建模", "曲师", "开发", "摄影", "作家", "其他"];
      const currentIndex = types.indexOf(this.selectedCreatorType);
      const nextIndex = (currentIndex + 1) % types.length;
      this.selectedCreatorType = types[nextIndex];
    },
    async loadArtists() {
      if (this.loadingArtists) return;
      this.loadingArtists = true;
      try {
        const data = await loadSecureData("./data/artists.json", { cache: "no-store" });
        this.artistsLastUpdated = data.meta?.lastUpdated || null;
        this.artists = Array.isArray(data.artists) ? data.artists : [];
      } catch (error) {
        console.warn("Could not load artists:", error);
        this.artistsError = error.message;
        this.artists = [];
      } finally {
        this.loadingArtists = false;
      }
    },
    getArtistsGradient(item) {
      const str = item?.id || item?.name || "";
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
      }
      const index = Math.abs(hash) % this.artistsGradients.length;
      return this.artistsGradients[index];
    },
    getArtistsPlatformDisplay(item) {
      const key = item?.platform || "other";
      const label = this.artistsPlatformLabels[key] || key;
      return { label };
    },
    getArtistsActionLabel(item) {
      const hasUrl = Boolean(item?.platform_url);
      if (hasUrl) {
        if (this.locale === "zh-CN" || this.locale === "zh-Hant") return "访问平台";
        if (this.locale === "ja-JP") return "開く";
        return "Visit";
      }
      if (this.locale === "zh-CN" || this.locale === "zh-Hant") return "查看";
      if (this.locale === "ja-JP") return "見る";
      return "View";
    },
    async openArtistPlatform(item) {
      const url = String(item?.platform_url || "").trim();
      if (url) {
        if (/^https?:\/\//i.test(url)) {
          this.openExternal(url);
        }
        return;
      }
    },
    async copyArtistQQ(item) {
      if (!item?.qq_group) return;
      const qqGroup = String(item.qq_group).trim();
      const ok = await copyToClipboard(qqGroup);
      if (!ok) return;
      this.artistsCopiedId = item.id;
      this.artistsCopiedAt = Date.now();
      window.setTimeout(() => {
        if (this.artistsCopiedId === item.id && Date.now() - this.artistsCopiedAt >= COPY_FEEDBACK_DELAY) {
          this.artistsCopiedId = null;
        }
      }, COPY_RESET_DELAY);
    },
  },
  watch: {
    activeModule(newVal) {
      if (newVal === "artists" && !this.loadingArtists) this.loadArtists();
    },
  },
  mounted() {
    const handler = () => {
      if (document.hidden) return;
      if (this.activeModule === "artists" && !this.loadingArtists) {
        this.loadArtists();
      }
    };
    this._artistsVisibilityHandler = handler;
    document.addEventListener("visibilitychange", handler);
    if (this.activeModule === "artists") {
      this.loadArtists();
    }
  },
  beforeUnmount() {
    if (this._artistsVisibilityHandler) {
      document.removeEventListener("visibilitychange", this._artistsVisibilityHandler);
      this._artistsVisibilityHandler = null;
    }
  },
};
