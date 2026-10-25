




import { loadSecureData } from "../utils/dataLoader.js";
import { getSafeExternalUrl, sanitizeHtml } from "../utils/helpers.js";

const GUIDE_VIDEOS_URL = "./data/guide_videos.json";
const GUIDE_TUTORIALS_URL = "./data/guide_tutorials.json";


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

export const guideMixin = {
  data() {
    return {
      guideView: 'videos', 
      guideVideos: [],
      guideTutorials: [],
      guideSearchQuery: "",
      loadingGuideVideos: false,
      loadingGuideTutorials: false,
      guideVideosError: null,
      guideTutorialsError: null,
      selectedTutorial: null,
    };
  },
  props: {
    activeModule: String,
  },
  computed: {
    guideTitle() {
      return this.strings.buttonGuide;
    },
    guideViews() {
      return [
        {
          key: 'videos',
          label: this.strings.guideTabVideos,
          icon: '📹',
        },
        {
          key: 'tutorials',
          label: this.strings.guideTabArticles,
          icon: '📄',
        },
      ];
    },
    filteredGuideVideos() {
      const list = Array.isArray(this.guideVideos) ? this.guideVideos : [];
      const query = (this.guideSearchQuery || "").trim().toLowerCase();
      if (!query) return list;
      return list.filter((video) => {
        const title = String(video.title || "").toLowerCase();
        const author = String(video.author_name || "").toLowerCase();
        return title.includes(query) || author.includes(query);
      });
    },
    filteredGuideTutorials() {
      const list = Array.isArray(this.guideTutorials) ? this.guideTutorials : [];
      const query = (this.guideSearchQuery || "").trim().toLowerCase();
      if (!query) return list;
      return list.filter((tutorial) => {
        const title = String(tutorial.title || "").toLowerCase();
        const author = String(tutorial.author || "").toLowerCase();
        const description = String(tutorial.description || "").toLowerCase();
        const content = String(tutorial.content || "").toLowerCase();
        return (
          title.includes(query) ||
          author.includes(query) ||
          description.includes(query) ||
          content.includes(query)
        );
      });
    },
  },
  methods: {
    async loadGuideVideos() {
      if (this.loadingGuideVideos) return;
      this.loadingGuideVideos = true;
      this.guideVideosError = null;
      try {
        const data = await loadSecureData(GUIDE_VIDEOS_URL, { cache: 'no-store' });
        
        this.guideVideos = Array.isArray(data.videos)
          ? data.videos.sort((a, b) => {
            const priorityA = a.priority || 0;
            const priorityB = b.priority || 0;
            if (priorityA !== priorityB) return priorityA - priorityB;
            return (a.pub_date || 0) - (b.pub_date || 0);
          })
          : [];
      } catch (err) {
        console.warn('[guide] load videos failed:', err);
        this.guideVideosError = this.strings.loadVideosFailed || "Failed to load videos";
        this.guideVideos = [];
      } finally {
        this.loadingGuideVideos = false;
      }
    },

    async loadGuideTutorials() {
      if (this.loadingGuideTutorials) return;
      this.loadingGuideTutorials = true;
      this.guideTutorialsError = null;
      try {
        const data = await loadSecureData(GUIDE_TUTORIALS_URL, { cache: 'no-store' });
        this.guideTutorials = Array.isArray(data.tutorials) ? data.tutorials : [];
      } catch (err) {
        console.warn('[guide] load tutorials failed:', err);
        this.guideTutorialsError = this.strings.loadTutorialsFailed || "Failed to load tutorials";
        this.guideTutorials = [];
      } finally {
        this.loadingGuideTutorials = false;
      }
    },

    formatVideoCount(num) {
      return formatCount(num, this.locale);
    },

    formatVideoDuration(seconds) {
      return formatDuration(seconds);
    },

    openBilibiliVideo(bvid) {
      if (!bvid) return;
      const url = `https://www.bilibili.com/video/${bvid}`;
      this.openExternal(url);
    },

    openTutorial(tutorial) {
      if (!tutorial) {
        this.selectedTutorial = null;
        return;
      }
      const safeContent = sanitizeHtml(tutorial.content || "");
      this.selectedTutorial = { ...tutorial, safeContent };
    },

    closeTutorialModal() {
      this.selectedTutorial = null;
    },

    openExternal(url) {
      const safeUrl = getSafeExternalUrl(url);
      if (!safeUrl) return;
      window.open(safeUrl, '_blank', 'noopener,noreferrer');
    },
  },
  watch: {
    activeModule(newVal) {
      if (newVal === 'guide') {
        if (this.guideView === 'videos' && !this.loadingGuideVideos && this.guideVideos.length === 0) {
          this.loadGuideVideos();
        }
        if (this.guideView === 'tutorials' && !this.loadingGuideTutorials && this.guideTutorials.length === 0) {
          this.loadGuideTutorials();
        }
      }
    },
    guideView(newVal) {
      if (this.activeModule !== 'guide') return;
      if (newVal === 'videos' && !this.loadingGuideVideos && this.guideVideos.length === 0) {
        this.loadGuideVideos();
      }
      if (newVal === 'tutorials' && !this.loadingGuideTutorials && this.guideTutorials.length === 0) {
        this.loadGuideTutorials();
      }
    },
  },
  mounted() {
    if (this.activeModule === 'guide') {
      this.loadGuideVideos();
    }
  },
};
