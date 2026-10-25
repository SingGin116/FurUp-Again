




import { loadSecureData } from "../utils/dataLoader.js";
import { getSafeExternalUrl } from "../utils/helpers.js";

const RECOMMEND_VIDEOS_URL = "./data/recommend_videos.json";
const RECOMMEND_GAMES_URL = "./data/recommend_games.json";


function formatCount(num, locale) {
  const n = Number(num);
  if (!Number.isFinite(n)) return "0";
  const stripZero = (value) => String(value).replace(/\.0$/, "");

  if (locale === "zh-CN" || locale === "zh-Hant") {
    if (n >= 100000000) return stripZero((n / 100000000).toFixed(1)) + "亿";
    if (n >= 10000) return stripZero((n / 10000).toFixed(1)) + "万";
    return String(n);
  }

  if (locale === "ja-JP") {
    if (n >= 100000000) return stripZero((n / 100000000).toFixed(1)) + "億";
    if (n >= 10000) return stripZero((n / 10000).toFixed(1)) + "万";
    return String(n);
  }

  if (n >= 1000000) return stripZero((n / 1000000).toFixed(1)) + "m";
  if (n >= 1000) return stripZero((n / 1000).toFixed(1)) + "k";
  return String(n);
}


function formatDuration(seconds) {
  if (!seconds) return '0:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export const recommendMixin = {
  data() {
    return {
      recommendView: 'videos', 
      recommendCategory: '全部', 
      recommendGameType: '全部', 
      recommendVideos: [],
      recommendGames: [],
      recommendSearchQuery: "",
      loadingRecommendVideos: false,
      loadingRecommendGames: false,
      recommendVideosError: null,
      recommendGamesError: null,
    };
  },
  props: {
    activeModule: String,
  },
  computed: {
    recommendTitle() {
      return this.strings.buttonRecommend;
    },
    recommendViews() {
      return [
        { key: 'videos', label: this.strings.recommendTabVideos || '视频', icon: '📹' },
        { key: 'games', label: this.strings.recommendTabGames || '游戏', icon: '🎮' },
      ];
    },
    
    recommendCategories() {
      const categories = ['全部'];
      const videoCats = new Set();
      this.recommendVideos.forEach(video => {
        if (video.category) {
          videoCats.add(video.category);
        }
      });
      return categories.concat(Array.from(videoCats).sort());
    },
    
    recommendGameTypes() {
      const types = ['全部'];
      const gameTypes = new Set();
      this.recommendGames.forEach(game => {
        if (game.game_type) {
          gameTypes.add(game.game_type);
        }
      });
      return types.concat(Array.from(gameTypes).sort());
    },
    
    filteredRecommendVideos() {
      let list = Array.isArray(this.recommendVideos) ? this.recommendVideos : [];
      if (this.recommendCategory !== '全部') {
        list = list.filter(video => video.category === this.recommendCategory);
      }
      const query = (this.recommendSearchQuery || "").trim().toLowerCase();
      if (!query) return list;
      return list.filter((video) => {
        const title = String(video.title || "").toLowerCase();
        const author = String(video.author_name || "").toLowerCase();
        return title.includes(query) || author.includes(query);
      });
    },
    
    filteredRecommendGames() {
      let list = Array.isArray(this.recommendGames) ? this.recommendGames : [];
      
      if (this.recommendGameType !== '全部') {
        list = list.filter(game => game.game_type === this.recommendGameType);
      }
      
      const query = (this.recommendSearchQuery || "").trim().toLowerCase();
      if (!query) return list;
      return list.filter((game) => {
        const name = String(game.name || "").toLowerCase();
        const studio = String(game.studio || "").toLowerCase();
        const note = String(game.note || "").toLowerCase();
        return name.includes(query) || studio.includes(query) || note.includes(query);
      });
    },
  },
  methods: {
    async loadRecommendVideos() {
      if (this.loadingRecommendVideos) return;
      this.loadingRecommendVideos = true;
      this.recommendVideosError = null;
      try {
        const data = await loadSecureData(RECOMMEND_VIDEOS_URL, { cache: 'no-store' });
        
        this.recommendVideos = Array.isArray(data.videos)
          ? data.videos.sort((a, b) => {
            const priorityA = a.priority || 50;
            const priorityB = b.priority || 50;
            if (priorityA !== priorityB) return priorityA - priorityB;
            return (b.pub_date || 0) - (a.pub_date || 0);
          })
          : [];
      } catch (err) {
        console.warn('[recommend] load videos failed:', err);
        this.recommendVideosError = this.strings.loadVideosFailed || "Failed to load videos";
        this.recommendVideos = [];
      } finally {
        this.loadingRecommendVideos = false;
      }
    },

    formatRecommendCount(num) {
      return formatCount(num, this.locale);
    },

    formatRecommendDuration(seconds) {
      return formatDuration(seconds);
    },

    openRecommendVideo(bvid) {
      if (!bvid) return;
      const url = `https://www.bilibili.com/video/${bvid}`;
      this.openExternal(url);
    },

    openExternal(url) {
      const safeUrl = getSafeExternalUrl(url);
      if (!safeUrl) return;
      window.open(safeUrl, '_blank', 'noopener,noreferrer');
    },

    cycleRecommendCategory() {
      const categories = this.recommendCategories;
      const currentIndex = categories.indexOf(this.recommendCategory);
      const nextIndex = (currentIndex + 1) % categories.length;
      this.recommendCategory = categories[nextIndex];
    },

    cycleRecommendGameType() {
      const types = this.recommendGameTypes;
      const currentIndex = types.indexOf(this.recommendGameType);
      const nextIndex = (currentIndex + 1) % types.length;
      this.recommendGameType = types[nextIndex];
    },

    async loadRecommendGames() {
      if (this.loadingRecommendGames) return;
      this.loadingRecommendGames = true;
      this.recommendGamesError = null;
      try {
        const data = await loadSecureData(RECOMMEND_GAMES_URL, { cache: 'no-store' });
        this.recommendGames = Array.isArray(data.games)
          ? data.games.sort((a, b) => {
            const priorityA = a.priority || 50;
            const priorityB = b.priority || 50;
            return priorityA - priorityB;
          })
          : [];
      } catch (err) {
        console.warn('[recommend] load games failed:', err);
        this.recommendGamesError = this.strings.loadGamesFailed || "Failed to load games";
        this.recommendGames = [];
      } finally {
        this.loadingRecommendGames = false;
      }
    },

    openRecommendGame(url) {
      if (!url) return;
      this.openExternal(url);
    },

    getCategoryDisplay(category) {
      const emojiMap = {
        '全部': '🌟',
        'All': '🌟',
        '舞蹈': '💃',
        'Dance': '💃',
        '抽象': '🎨',
        'Meme': '🎨',
        'vlog': '📹',
        'Vlog': '📹',
        '游戏': '🎮',
        'Game': '🎮',
        '日常': '☕',
        'Daily': '☕',
        '其他': '📦',
        'Other': '📦',
      };

      const translationMapEn = {
        '全部': 'All',
        '舞蹈': 'Dance',
        '抽象': 'Meme',
        'vlog': 'Vlog',
        '游戏': 'Game',
        '日常': 'Daily',
        '其他': 'Other',
      };

      const translationMapJa = {
        '全部': 'すべて',
        'All': 'すべて',
        '舞蹈': 'ダンス',
        'Dance': 'ダンス',
        '抽象': 'ネタ',
        'Meme': 'ネタ',
        'vlog': 'Vlog',
        'Vlog': 'Vlog',
        '游戏': 'ゲーム',
        'Game': 'ゲーム',
        '日常': '日常',
        'Daily': '日常',
        '其他': 'その他',
        'Other': 'その他',
      };

      const emoji = emojiMap[category] || '📺';
      let label = category;
      if (this.locale === "ja-JP") {
        label = translationMapJa[category] || translationMapEn[category] || category;
      } else if (this.locale !== "zh-CN" && this.locale !== "zh-Hant") {
        label = translationMapEn[category] || category;
      }

      return { emoji, label };
    },

    getGameTypeDisplay(type) {
      const emojiMap = {
        '全部': '🌟',
        'All': '🌟',
        'steam': '🎮',
        'Steam': '🎮',
        'minecraft': '🧱',
        'Minecraft': '🧱',
        '我的世界服务器': '🧱',
        'web': '🌐',
        'Web': '🌐',
        '网页游戏': '🌐',
      };

      const translationMapEn = {
        '全部': 'All',
        'steam': 'Steam',
        'minecraft': 'Minecraft',
        '我的世界服务器': 'Minecraft Server',
        'web': 'Web',
        '网页游戏': 'Web Game',
      };

      const translationMapJa = {
        '全部': 'すべて',
        'All': 'すべて',
        'steam': 'Steam',
        'Steam': 'Steam',
        'minecraft': 'マインクラフト',
        'Minecraft': 'マインクラフト',
        '我的世界服务器': 'マイクラサーバー',
        'web': 'ウェブ',
        'Web': 'ウェブ',
        '网页游戏': 'ウェブゲーム',
      };

      const emoji = emojiMap[type] || '🎮';
      let label = type;
      if (this.locale === "ja-JP") {
        label = translationMapJa[type] || translationMapEn[type] || type;
      } else if (this.locale !== "zh-CN" && this.locale !== "zh-Hant") {
        label = translationMapEn[type] || type;
      }

      return { emoji, label };
    },
  },
  watch: {
    activeModule(newVal) {
      if (newVal === 'recommend') {
        if (!this.loadingRecommendVideos && this.recommendVideos.length === 0) {
          this.loadRecommendVideos();
        }
        if (this.recommendView === 'games' && !this.loadingRecommendGames && this.recommendGames.length === 0) {
          this.loadRecommendGames();
        }
      }
    },
    recommendView(newVal) {
      if (newVal === 'videos' && !this.loadingRecommendVideos && this.recommendVideos.length === 0) {
        this.loadRecommendVideos();
      }
      if (newVal === 'games' && !this.loadingRecommendGames && this.recommendGames.length === 0) {
        this.loadRecommendGames();
      }
    },
  },
  mounted() {
    if (this.activeModule === 'recommend') {
      this.loadRecommendVideos();
    }
  },
};
