import { USERS_URL, translations, LANG_KEY, MOBILE_BREAKPOINT, SCROLL_TO_TOP_THRESHOLD } from "../utils/constants.js";
import { applyTheme, getInitialTheme, getSafeExternalUrl } from "../utils/helpers.js";
import { loadSecureData } from "../utils/dataLoader.js";

const LANGUAGE_CYCLE = ["zh-CN", "zh-Hant", "en-US", "ja-JP"];


function getInitialLang() {
  try {
    const saved = localStorage.getItem(LANG_KEY);
    if (saved && translations[saved]) {
      return saved;
    }
  } catch (e) { }
  
  return "zh-CN";
}

export const baseMixin = {
  data() {
    return {
      loading: true,
      error: null,
      lastUpdated: null,
      users: [],
      currentTheme:
        document.documentElement.getAttribute("data-theme") ||
        getInitialTheme(),
      locale: getInitialLang(),
      activeModule: "cards",
      resizeHandler: null,
      totalCreators: 0,
      logoUrl: "./assets/logo.jpg",
      logoPath: "./assets/logo.jpg",
      shuffleOnLoad: true,
      showBackToTop: false,
      mobileNavProgress: 0,
      isMobile: window.innerWidth < MOBILE_BREAKPOINT,
      showMobileSearch: false,
      friendLinks: [],
      loadingLinks: false,
      siteConfig: {},
      currentDomain: typeof window !== "undefined" ? window.location.hostname : "",
    };
  },
  computed: {
    icpNumber() {
      return this.siteConfig?.icpNumber || "";
    },
    shouldShowIcp() {
      if (!this.icpNumber) return false;
      const allowedDomains = this.siteConfig?.icpDomains;
      if (Array.isArray(allowedDomains) && allowedDomains.length > 0) {
        return allowedDomains.includes(this.currentDomain);
      }
      return true;
    },
    strings() {
      return translations[this.locale];
    },
    nextLocale() {
      const idx = LANGUAGE_CYCLE.indexOf(this.locale);
      const nextIndex = idx === -1 ? 0 : (idx + 1) % LANGUAGE_CYCLE.length;
      return LANGUAGE_CYCLE[nextIndex];
    },
    languageToggleTitle() {
      const next = this.nextLocale;
      const labels = {
        "zh-CN": { "zh-CN": "简体", "zh-Hant": "繁體", "en-US": "English", "ja-JP": "日本語" },
        "zh-Hant": { "zh-CN": "简体", "zh-Hant": "繁體", "en-US": "English", "ja-JP": "日本語" },
        "en-US": { "zh-CN": "Simplified", "zh-Hant": "Traditional", "en-US": "English", "ja-JP": "Japanese" },
        "ja-JP": { "zh-CN": "簡体字", "zh-Hant": "繁体字", "en-US": "英語", "ja-JP": "日本語" },
      };
      const nextLabel = labels[this.locale]?.[next] || next;
      if (this.locale === "zh-CN") return `切换到 ${nextLabel}`;
      if (this.locale === "zh-Hant") return `切換到 ${nextLabel}`;
      if (this.locale === "ja-JP") return `${nextLabel}へ`;
      return `Switch to ${nextLabel}`;
    },
    activeSearchQuery: {
      get() {
        switch (this.activeModule) {
          case "birthdays":
            return this.birthdaysSearchQuery ?? "";
          case "costumes":
            return this.studioSearchQuery ?? "";
          case "meetups":
            return this.meetupsSearchQuery ?? "";
          case "guide":
            return this.guideSearchQuery ?? "";
          case "recommend":
            return this.recommendSearchQuery ?? "";
          case "artists":
            return this.artistsSearchQuery ?? "";
          case "thanks":
            return this.thanksSearchQuery ?? "";
          case "chart":
          case "cards":
          default:
            return this.searchQuery ?? "";
        }
      },
      set(value) {
        const nextValue = value == null ? "" : value;
        switch (this.activeModule) {
          case "birthdays":
            this.birthdaysSearchQuery = nextValue;
            break;
          case "costumes":
            this.studioSearchQuery = nextValue;
            break;
          case "meetups":
            this.meetupsSearchQuery = nextValue;
            break;
          case "guide":
            this.guideSearchQuery = nextValue;
            break;
          case "recommend":
            this.recommendSearchQuery = nextValue;
            break;
          case "artists":
            this.artistsSearchQuery = nextValue;
            break;
          case "thanks":
            this.thanksSearchQuery = nextValue;
            break;
          case "chart":
          case "cards":
          default:
            this.searchQuery = nextValue;
            break;
        }
      },
    },
    activeSearchPlaceholder() {
      const strings = this.strings || {};
      switch (this.activeModule) {
        case "meetups":
          return strings.meetupsSearchPlaceholder || strings.searchPlaceholder;
        case "costumes":
          return strings.costumesSearchPlaceholder || strings.searchPlaceholder;
        case "thanks":
          if (this.thanksSubModule === "links") {
            return strings.linksSearchPlaceholder || strings.thanksSearchPlaceholder || strings.searchPlaceholder;
          }
          return strings.thanksSearchPlaceholder || strings.searchPlaceholder;
        case "recommend":
          if (this.recommendView === "games") {
            return strings.recommendSearchGames || strings.searchPlaceholder;
          }
          return strings.recommendSearchVideos || strings.searchPlaceholder;
        default:
          return strings.searchPlaceholder;
      }
    },
  },
  mounted() {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab");
    const allowedTabs = [
      "cards",
      "chart",
      "birthdays",
      "costumes",
      "meetups",
      "guide",
      "recommend",
      "artists",
      "thanks",
    ];
    if (tab && allowedTabs.includes(tab)) {
      this.activeModule = tab;
    }

    this.init();

    if (this.activeModule === "chart") {
      this.$nextTick(() => {
        this.initChartObserver?.();
        this.renderFansChart?.();
      });
    }

    window.addEventListener("scroll", this.onWindowScroll);
    let resizeRaf = null;
    this.resizeHandler = () => {
      this.isMobile = window.innerWidth < MOBILE_BREAKPOINT;
      if (!this.isMobile && this.showMobileSearch) {
        this.showMobileSearch = false;
      }

      if (!this.fansChartInstance) return;
      if (resizeRaf !== null) return;
      resizeRaf = requestAnimationFrame(() => {
        resizeRaf = null;
        try {
          this.fansChartInstance.resize();
        } catch (e) { }
        if (this.activeModule !== "chart") {
          this.pendingChartRender = true;
        }
      });
    };
    window.addEventListener("resize", this.resizeHandler);
  },
  beforeUnmount() {
    window.removeEventListener("scroll", this.onWindowScroll);
    if (this.resizeHandler) {
      window.removeEventListener("resize", this.resizeHandler);
    }
    if (this.resizeObserver) {
      try {
        this.resizeObserver.disconnect();
      } catch (e) { }
    }
    if (this.fansChartInstance) {
      try {
        this.fansChartInstance.dispose();
      } catch (e) { }
      this._chartClickBound = false;
    }
    if (this.cleanupChartDomListener) {
      this.cleanupChartDomListener();
    }
  },
  methods: {
    setActiveModule(module, event) {
      this.activeModule = module;
      if (this.isMobile && event && event.target) {
        const nav = this.$refs.mobileNav;
        if (nav) {
          const btn = event.target.closest('button');
          if (btn) {
            const navRect = nav.getBoundingClientRect();
            const btnRect = btn.getBoundingClientRect();
            const threshold = 80;
            const nudgeAmount = 50;
            if (btnRect.right > navRect.right - threshold) {
              nav.scrollBy({ left: nudgeAmount, behavior: 'smooth' });
            }
            else if (btnRect.left < navRect.left + threshold) {
              nav.scrollBy({ left: -nudgeAmount, behavior: 'smooth' });
            }
          }
        }
      }
    },
    toggleDarkMode() {
      const next = this.currentTheme === "dark" ? "light" : "dark";
      this.currentTheme = next;
      applyTheme(next);
    },
    toggleLanguage() {
      const next = this.nextLocale;
      this.locale = next;
      try {
        localStorage.setItem(LANG_KEY, next);
      } catch (e) { }
    },
    toggleMobileSearch() {
      if (!this.isMobile) return;
      this.showMobileSearch = !this.showMobileSearch;
      if (this.showMobileSearch) {
        this.$nextTick(() => {
          const input = this.$refs.mobileSearchInput;
          if (input && typeof input.focus === "function") {
            input.focus();
          }
        });
      }
    },
    async init() {
      this.loading = true;
      try {
        await this.checkLogo();

        
        const cachedLastUpdated = this.getCachedLastUpdated();
        const shouldReload = await this.checkForUpdates(cachedLastUpdated);

        let data;
        if (shouldReload) {
          
          data = await loadSecureData(USERS_URL);
          this.setCachedLastUpdated(data.meta?.lastUpdated);
        } else {
          
          const cached = this.getCachedUsers();
          if (cached) {
            data = cached;
          } else {
            
            data = await loadSecureData(USERS_URL);
            this.setCachedLastUpdated(data.meta?.lastUpdated);
          }
        }

        this.users = (data.users || []).map((user) => ({
          ...user,
          followers: user.followers ?? null,
          likes: user.likes ?? null,
          playCount: user.playCount ?? null,
          diff7d: user.diff7d ?? null,
          
          // 注意：不要把 .jpg 改写成 .webp——B 站 CDN 上没有这些 webp 文件（全部 404），
          // 原 .jpg 链接才是有效的；头像体积优化由 getAvatarUrl 追加 @144w_144h.webp 参数完成
          avatar: user.avatar || null,
        }));

        
        
        

        if (this.shuffleOnLoad) {
          this.shuffleUsers();
        }
        this.precomputeBirthdays();
        const rawUpdated = data.meta?.lastUpdated || null;
        this.lastUpdated = rawUpdated ? rawUpdated.slice(0, 10) : null;
        this.totalCreators = this.users.length;
        if (typeof this.loadPreviousSnapshot === "function") {
          await this.loadPreviousSnapshot();
        }
        if (this.activeModule === "chart") {
          this.renderFansChart();
        } else {
          this.pendingChartRender = true;
        }
        
        this.loadFriendLinks();
        this.loadSiteConfig();
      } catch (err) {
        this.error = this.strings.loadFailed || "加载失败，请稍后重试";
      } finally {
        this.loading = false;
      }
    },
    async checkForUpdates() {
      return true;
    },


    


    getCachedLastUpdated() {
      try {
        return localStorage.getItem('furup_last_updated');
      } catch {
        return null;
      }
    },

    


    setCachedLastUpdated(lastUpdated) {
      try {
        if (lastUpdated) {
          localStorage.setItem('furup_last_updated', lastUpdated);
        }
      } catch (error) {
        console.warn('Failed to cache lastUpdated:', error);
      }
    },

    


    getCachedUsers() {
      try {
        const cached = localStorage.getItem('furup_users_data');
        return cached ? JSON.parse(cached) : null;
      } catch {
        return null;
      }
    },

    


    async preloadAvatars() {
      try {
        
        const visibleUsers = this.pagedAccounts || this.users.slice(0, 40);

        
        if (this.batchLoadAvatars) {
          this.batchLoadAvatars(visibleUsers, 10).catch(err => {
            console.warn('Avatar preload failed:', err);
          });
        }
      } catch (error) {
        console.warn('Failed to preload avatars:', error);
      }
    },
    async loadSiteConfig() {
      try {
        const data = await loadSecureData("./data/config.json");
        this.siteConfig = data && typeof data === "object" ? data : {};
      } catch (error) {
        this.siteConfig = {};
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
        this.friendLinks = [];
      } finally {
        this.loadingLinks = false;
      }
    },
    async checkLogo() {
      try {
        const res = await fetch(this.logoPath, { method: "HEAD" });
        if (res.ok) {
          this.logoUrl = this.logoPath;
        }
      } catch (err) { }
    },
    openProfile(account) {
      this.highlightUid(account.uid);
      const profileUrl = `https://space.bilibili.com/${account.uid}`;
      this.openExternal(profileUrl);
    },
    openExternal(url) {
      const safeUrl = getSafeExternalUrl(url);
      if (!safeUrl) return;
      window.open(safeUrl, "_blank", "noopener,noreferrer");
    },
    scrollToTop() {
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    onMobileNavScroll(e) {
      const el = e.target;
      if (el) {
        const maxScroll = el.scrollWidth - el.clientWidth;
        if (maxScroll > 0) {
          this.mobileNavProgress = el.scrollLeft / maxScroll;
        }
      }
    },
    onWindowScroll() {
      this.showBackToTop = window.scrollY > SCROLL_TO_TOP_THRESHOLD;
      this.handleChartScroll?.();
      this.handleCardScroll?.();
    },
    handleCardScroll() {
      
    },
  },
};
