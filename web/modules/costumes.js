import { loadSecureData } from "../utils/dataLoader.js";

export const costumesMixin = {
  data() {
    return {
      costumesStatus: "ready",
      studios: [],
      studioSearchQuery: "",
      selectedRegion: "All", 
      selectedStyle: "All", 
      sortMode: "default", 
      loadingStudios: false,

      studiosCopiedId: null, 


      
      
      pastelGradients: [
        "from-pink-500 to-rose-500",
        "from-purple-500 to-fuchsia-500",
        "from-blue-500 to-indigo-500",
        "from-cyan-500 to-sky-500",
        "from-teal-500 to-emerald-500",
        "from-green-500 to-lime-500",
        "from-amber-500 to-yellow-500",
        "from-orange-500 to-amber-500",
        "from-red-500 to-rose-500",
        "from-violet-500 to-purple-500",
        "from-fuchsia-500 to-pink-500",
        "from-sky-500 to-cyan-500",
        "from-emerald-500 to-teal-500",
        "from-lime-500 to-green-500",
        "from-yellow-500 to-orange-500",
      ],
    };
  },
  computed: {
    costumesTitle() {
      return this.strings.buttonCostumes;
    },

    
    getStyleDisplay() {
      return (style) => {
        const key = (this.locale === "zh-CN" || this.locale === "zh-Hant") ? "zh-CN" : this.locale === "ja-JP" ? "ja-JP" : "en-US";
        const map = {
          "zh-CN": {
            Kemono: "日系",
            Toon: "美系",
            Hybrid: "混系",
            Realistic: "写实",
            Kig: "Kig",
            Other: "其他",
          },
          "en-US": {
            Kemono: "Kemono",
            Toon: "Toon",
            Hybrid: "Hybrid",
            Realistic: "Realistic",
            Kig: "Kigurumi",
            Other: "Other",
          },
          "ja-JP": {
            Kemono: "ケモノ",
            Toon: "トゥーン",
            Hybrid: "ハイブリッド",
            Realistic: "リアル",
            Kig: "着ぐるみ",
            Other: "その他",
          },
        };

        return map[key]?.[style] || style;
      };
    },

    getStyleFilterLabel() {
      if (this.selectedStyle === "All") {
        if (this.locale === "zh-CN" || this.locale === "zh-Hant") return this.locale === "zh-Hant" ? "風格" : "风格";
        if (this.locale === "ja-JP") return "スタイル";
        return "Style";
      }
      return this.getStyleDisplay(this.selectedStyle);
    },

    
    getStudioDisplayName() {
      return (studio) => {
        if ((this.locale === "zh-CN" || this.locale === "zh-Hant") && studio.name_zh) {
          return studio.name_zh;
        }
        return studio.name;
      };
    },

    regions() {
      const allRegions = ["All"];
      const uniqueRegions = [...new Set(this.studios.map(s => s.region))];
      return [...allRegions, ...uniqueRegions.sort()];
    },

    regionLabels() {
      const key = (this.locale === "zh-CN" || this.locale === "zh-Hant") ? "zh-CN" : this.locale === "ja-JP" ? "ja-JP" : "en-US";
      const maps = {
        "zh-CN": { All: "全部", China: "中国", Japan: "日本", US: "美国", Other: "其他" },
        "en-US": { All: "All", China: "China", Japan: "Japan", US: "US", Other: "Other" },
        "ja-JP": { All: "すべて", China: "中国", Japan: "日本", US: "米国", Other: "その他" },
      };

      return maps[key];
    },

    filteredStudios() {
      let result = [...this.studios];

      
      if (this.selectedRegion !== "All") {
        result = result.filter(s => s.region === this.selectedRegion);
      }

      
      result = result.filter(studio => {
        const matchesRegion = this.selectedRegion === "All" || studio.region === this.selectedRegion;

        let matchesStyle = true;
        if (this.selectedStyle !== "All") {
          if (Array.isArray(studio.style)) {
            matchesStyle = studio.style.includes(this.selectedStyle);
          } else {
            matchesStyle = studio.style === this.selectedStyle;
          }
        }

        let matchesSearch = true;
        if (this.studioSearchQuery.trim()) {
          const query = this.studioSearchQuery.toLowerCase();
          matchesSearch =
            studio.name.toLowerCase().includes(query) ||
            (studio.name_zh && studio.name_zh.includes(query));
        }

        return matchesRegion && matchesStyle && matchesSearch;
      });

      
      if (this.sortMode === "default") {
        
        result.sort((a, b) => {
          const priorityA = a.priority !== undefined ? a.priority : 50;
          const priorityB = b.priority !== undefined ? b.priority : 50;
          return priorityA - priorityB;
        });
      } else {
        
        result.sort((a, b) => {
          const yearA = a.founded_year !== null && a.founded_year !== undefined ? a.founded_year : 9999;
          const yearB = b.founded_year !== null && b.founded_year !== undefined ? b.founded_year : 9999;
          return this.sortMode === "asc" ? (yearA - yearB) : (yearB - yearA);
        });
      }

      return result;
    },

    studioCount() {
      return {
        total: this.studios.length,
        filtered: this.filteredStudios.length,
      };
    },
  },
  methods: {
    async loadStudios() {
      this.loadingStudios = true;
      try {
        const data = await loadSecureData("./data/studios.json");
        this.studios = data.studios || [];
      } catch (error) {
        console.error("Error loading studios:", error);
        this.studios = [];
      } finally {
        this.loadingStudios = false;
      }
    },

    
    getStudioGradient(studio) {
      const str = studio.id || studio.name;
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
      }
      const index = Math.abs(hash) % this.pastelGradients.length;
      return "bg-gradient-to-r " + this.pastelGradients[index];
    },

    openStudioWebsite(studio) {
      if (studio.homepage_url) {
        this.openExternal(studio.homepage_url);
      }
    },

    setRegionFilter(region) {
      this.selectedRegion = region;
    },

    cycleRegionFilter() {
      
      const regionCycle = ["All", "China", "Japan", "US"];
      const currentIndex = regionCycle.indexOf(this.selectedRegion);
      const nextIndex = (currentIndex + 1) % regionCycle.length;
      this.selectedRegion = regionCycle[nextIndex];
    },

    getRegionLabel() {
      return this.regionLabels[this.selectedRegion] || this.selectedRegion;
    },

    cycleStyleFilter() {
      
      const styleCycle = ["All", "Kemono", "Toon", "Hybrid", "Realistic", "Kig", "Other"];
      const currentIndex = styleCycle.indexOf(this.selectedStyle);
      const nextIndex = (currentIndex + 1) % styleCycle.length;
      this.selectedStyle = styleCycle[nextIndex];
    },

    toggleYearSort() {
      
      if (this.sortMode === "default") {
        this.sortMode = "asc";
      } else if (this.sortMode === "asc") {
        this.sortMode = "desc";
      } else {
        this.sortMode = "default";
      }
    },

    getSortLabel() {
      if (this.sortMode === "default") {
        return this.strings.costumesSortDefault;
      } else if (this.sortMode === "asc") {
        return this.strings.costumesSortEarliest;
      } else if (this.sortMode === "desc") {
        return this.strings.costumesSortLatest;
      }
      return this.strings.costumesSortDefault;
    },

    
    getLinkTypeDisplay(studio) {
      const types = {
        bilibili: { label: "B站", labelEn: "Bilibili", labelJa: "bilibili" },
        x: { label: "X", labelEn: "X", labelJa: "X" },
        website: { label: "官网", labelEn: "Website", labelJa: "公式" },
        weibo: { label: "微博", labelEn: "Weibo", labelJa: "Weibo" },
        taobao: { label: "淘宝", labelEn: "Taobao", labelJa: "Taobao" },
        douyin: { label: "抖音", labelEn: "Douyin", labelJa: "Douyin" },
        xiaohongshu: { label: "小红书", labelEn: "Xiaohongshu", labelJa: "RED" },
        other: { label: "链接", labelEn: "Link", labelJa: "リンク" },
      };

      const pickLabel = (t) => {
        if (this.locale === "zh-CN" || this.locale === "zh-Hant") return t.label;
        if (this.locale === "ja-JP") return t.labelJa || t.labelEn || t.label;
        return t.labelEn || t.label;
      };

      if (studio.link_type && types[studio.link_type]) {
        const t = types[studio.link_type];
        return { label: pickLabel(t) };
      }

      
      const url = studio.homepage_url || '';
      if (url.includes('bilibili.com')) return { label: pickLabel(types.bilibili) };
      if (url.includes('twitter.com') || url.includes('x.com')) return { label: types.x.label };
      if (url.includes('weibo.')) return { label: pickLabel(types.weibo) };
      if (url.includes('taobao.')) return { label: pickLabel(types.taobao) };
      if (url.includes('douyin.')) return { label: pickLabel(types.douyin) };
      if (url.includes('xiaohongshu.')) return { label: pickLabel(types.xiaohongshu) };

      return { label: pickLabel(types.website) };
    },

    
    getMakerTypeDisplay(studio) {
      const types = {
        studio: { label: "工作室", labelEn: "Studio", labelJa: "スタジオ" },
        individual: { label: "装师", labelEn: "Maker", labelJa: "個人" },
      };

      if (studio.maker_type && types[studio.maker_type]) {
        const t = types[studio.maker_type];
        if (this.locale === "zh-CN" || this.locale === "zh-Hant") return t.label;
        if (this.locale === "ja-JP") return t.labelJa || t.labelEn;
        return t.labelEn;
      }

      
      if (studio.maker_type) {
        return studio.maker_type;
      }

      return null;
    },

    async copyStudioGroup(studio) {
      if (!studio.qq_group) return;
      try {
        await navigator.clipboard.writeText(studio.qq_group);
        this.studiosCopiedId = studio.id;
        setTimeout(() => {
          if (this.studiosCopiedId === studio.id) {
            this.studiosCopiedId = null;
          }
        }, 2000);
      } catch (err) {
        console.error("Failed to copy group:", err);
        
        const textarea = document.createElement("textarea");
        textarea.value = studio.qq_group;
        document.body.appendChild(textarea);
        textarea.select();
        try {
          document.execCommand("copy");
          this.studiosCopiedId = studio.id;
          setTimeout(() => {
            if (this.studiosCopiedId === studio.id) {
              this.studiosCopiedId = null;
            }
          }, 2000);
        } catch (e) {
          console.error("Fallback copy failed", e);
          const msg =
            (this.locale === "zh-CN" || this.locale === "zh-Hant")
              ? `复制失败，请手动复制：${studio.qq_group}`
              : this.locale === "ja-JP"
                ? `コピーに失敗しました。手動でコピーしてください: ${studio.qq_group}`
                : `Copy failed. Please copy manually: ${studio.qq_group}`;
          alert(msg);
        }
        document.body.removeChild(textarea);
      }
    },
  },
  watch: {
    activeModule(newVal) {
      if (newVal === "costumes" && this.studios.length === 0) {
        this.loadStudios();
      }
    },
  },
  mounted() {
    if (this.activeModule === "costumes") {
      this.loadStudios();
    }
  },
};
