import { escapeHtml, formatNumber } from "../utils/helpers.js";

export const chartMixin = {
  data() {
    return {
      fansChartInstance: null,
      resizeObserver: null,
      chartAccountUids: [],
      chartSortOrder: "desc",
      chartSkipCount: 0,
      chartMetric: "followers",
      pendingChartRender: false,
      chartRenderedData: [],
      chartContainerEl: null,
      chartDomListener: null,
      chartMaxBars: 200,
      chartShowAll: false,
      chartWindowPercent: 100,
      chartBatchSize: 50,
      chartCurrentBatch: 1,
      chartIsRendering: false,
      chartRenderQueue: null,
      _chartClickBound: false,
      _avatarsPreloadedCount: 0,
      isChartLoadingMore: false,
      lastChartScrollTs: 0,
      chartLoadMoreNudgePx: 240,
      chartPendingLoadMoreNudge: false,
      isChartPrefetching: false,
      chartPrefetchTarget: 0,
      chartPrefetchBatchAhead: 1,
      chartPrefetchChunkSize: 40,
    };
  },
  computed: {
    chartMetricConfig() {
      const labelMap = {
        followers: this.strings.metricFans,
        likes: this.strings.metricLikes,
        playCount: this.strings.metricPlays,
      };
      
      const isDark = this.currentTheme === "dark";
      const colorMap = {
        followers: isDark ? "#60a5fa" : "#2563eb",  
        likes: isDark ? "#fb923c" : "#f97316",      
        playCount: isDark ? "#2dd4bf" : "#14b8a6",  
      };
      const key = this.chartMetric || "followers";
      return {
        key,
        label: labelMap[key] || this.strings.metricFans,
        color: colorMap[key] || (isDark ? "#60a5fa" : "#2563eb"),
      };
    },
    metricOptions() {
      
      const isDark = this.currentTheme === "dark";
      return [
        {
          key: "followers",
          label: this.strings.metricFans,
          color: isDark ? "#60a5fa" : "#2563eb",
          disabled: false,
        },
        {
          key: "likes",
          label: this.strings.metricLikes,
          color: isDark ? "#fb923c" : "#f97316",
          disabled: false,
        },
        {
          key: "playCount",
          label: this.strings.metricPlays,
          color: isDark ? "#2dd4bf" : "#14b8a6",
          disabled: false,
        },
      ];
    },
    chartContextText() {
      const total =
        this.totalCreators || this.visibleAccounts.length || this.users.length;
      if (!total) return "";
      const shown =
        this.chartRenderedData.length ||
        Math.min(total, this.chartMaxBars || total);
      return this.strings.totalCreators.replace('{n}', total);
    },
    chartUsersSorted() {
      let base = [...this.visibleAccounts];
      base.sort((a, b) => {
        const key = this.chartMetricConfig.key;
        const va = a[key] ?? 0;
        const vb = b[key] ?? 0;
        return this.chartSortOrder === "desc" ? vb - va : va - vb;
      });

      const total = base.length;
      if (this.chartSkipCount > 0 && total > 0) {
        const skipCount = Math.floor((this.chartSkipCount / 100) * total);
        const safeSkip = Math.min(skipCount, Math.max(total - 1, 0));
        base = base.slice(safeSkip);
      }

      if (!this.chartShowAll && this.chartMaxBars && base.length > this.chartMaxBars) {
        base = base.slice(0, this.chartMaxBars);
      }

      return base;
    },
  },
  watch: {
    activeModule(newValue) {
      const url = new URL(window.location);
      url.searchParams.set("tab", newValue);
      window.history.replaceState({}, "", url);

      if (newValue === "chart") {
        this.$nextTick(() => {
          this.initChartObserver();
          setTimeout(() => {
            this.renderFansChart();
          }, 50);
        });
      }
    },
    currentTheme() {
      
      if (!this.chartUsersSorted.length) return;

      if (this.activeModule === "chart" && this.fansChartInstance) {
        
        this.$nextTick(() => {
          requestAnimationFrame(() => {
            this.renderFansChart();
          });
        });
      } else {
        
        this.pendingChartRender = true;
      }
    },
    visibleAccounts: {
      handler(newVal) {
        if (!newVal.length) {
          if (this.fansChartInstance) {
            try {
              this.fansChartInstance.clear();
            } catch (e) {}
          }
          this.pendingChartRender = false;
          return;
        }
        if (this.activeModule === "chart") {
          this.$nextTick(() => this.renderFansChart());
        } else {
          this.pendingChartRender = true;
        }
      },
      deep: true,
    },
  },
  methods: {
    nudgeChartScrollAfterLoadMore(chartEl) {
      if (!chartEl) return;
      if (!this.chartPendingLoadMoreNudge) return;
      this.chartPendingLoadMoreNudge = false;

      const rect = chartEl.getBoundingClientRect();
      const viewportHeight =
        window.innerHeight || document.documentElement.clientHeight || 0;
      if (!viewportHeight) return;
      const distanceToBottom = rect.bottom - viewportHeight;
      if (distanceToBottom < 0) return;

      const threshold = Math.min(400, Math.max(200, rect.height * 0.2));
      const margin = 24;
      const targetDistance = threshold + margin;
      const required = targetDistance - distanceToBottom;
      if (required <= 0) return;

      const minNudge = Math.max(0, this.chartLoadMoreNudgePx || 0);
      const maxNudge = 800;
      const nudge = Math.min(maxNudge, Math.max(minNudge, required));
      if (!nudge) return;

      window.scrollBy({ top: -nudge, left: 0, behavior: "auto" });
    },
    scheduleChartPrefetch(fullAccounts, currentRenderCount) {
      if (!Array.isArray(fullAccounts) || !fullAccounts.length) return;
      const target = Math.min(
        this.chartBatchSize * (this.chartCurrentBatch + this.chartPrefetchBatchAhead),
        fullAccounts.length
      );
      if (target <= this._avatarsPreloadedCount && target <= this.chartPrefetchTarget) {
        return;
      }
      this.chartPrefetchTarget = target;
      if (target <= currentRenderCount) return;
      if (this.isChartPrefetching) return;

      const chunkSize = Math.max(10, this.chartPrefetchChunkSize || 40);
      const idle = window.requestIdleCallback || ((cb) => setTimeout(cb, 50));
      this.isChartPrefetching = true;

      const loadChunk = () => {
        const desired = Math.min(this.chartPrefetchTarget, fullAccounts.length);
        if (this._avatarsPreloadedCount >= desired) {
          this.isChartPrefetching = false;
          return;
        }
        const nextEnd = Math.min(this._avatarsPreloadedCount + chunkSize, desired);
        const slice = fullAccounts.slice(this._avatarsPreloadedCount, nextEnd).filter((acc) => acc && acc.avatar);
        if (!slice.length) {
          this._avatarsPreloadedCount = nextEnd;
          idle(loadChunk);
          return;
        }
        const tasks = slice.map((acc) => {
          return new Promise((resolve) => {
            const img = new Image();
            img.onload = img.onerror = () => resolve(acc.avatar);
            img.src = acc.avatar;
          });
        });
        Promise.all(tasks)
          .catch(() => {})
          .finally(() => {
            this._avatarsPreloadedCount = nextEnd;
            idle(loadChunk);
          });
      };

      idle(loadChunk);
    },
    initChartObserver() {
      const chartEl = document.getElementById("fans-chart");
      if (!chartEl) return;

      if (this.resizeObserver) {
        try {
          this.resizeObserver.disconnect();
        } catch (e) {}
      }

      this.resizeObserver = new ResizeObserver(() => {
        const width = chartEl.clientWidth || 0;
        if (width === 0) return;
        if (!this.fansChartInstance) {
          this.renderFansChart();
        } else {
          try {
            this.fansChartInstance.resize();
          } catch (e) {}
        }
        this.pendingChartRender = false;
      });

      this.resizeObserver.observe(chartEl);
    },
    toggleChartSort() {
      this.chartSortOrder = this.chartSortOrder === "desc" ? "asc" : "desc";
      this.chartCurrentBatch = 1;
      this._avatarsPreloadedCount = 0;
      this.$nextTick(() => this.renderFansChart());
    },
    onChartFilterChange() {
      this.chartCurrentBatch = 1;
      this._avatarsPreloadedCount = 0;
      if (this.fansChartInstance) {
        try {
          this.fansChartInstance.dispose();
        } catch (e) {}
        this._chartClickBound = false;
        this.fansChartInstance = null;
      }
      this.$nextTick(() => this.renderFansChart());
    },
    setMetric(metricKey, disabled) {
      if (disabled) return;
      if (this.chartMetric === metricKey) return;
      this.chartMetric = metricKey;
      this.chartShowAll = false;
      this.chartCurrentBatch = 1;
      this._avatarsPreloadedCount = 0;
      if (this.fansChartInstance) {
        try {
          this.fansChartInstance.dispose();
        } catch (e) {}
        this._chartClickBound = false;
        this.fansChartInstance = null;
      }
      this.$nextTick(() => this.renderFansChart());
    },
    toggleShowAll() {
      const next = !this.chartShowAll;
      this.chartShowAll = next;
      this.chartCurrentBatch = 1;
      this._avatarsPreloadedCount = 0;

      if (this.fansChartInstance) {
        try {
          this.fansChartInstance.dispose();
        } catch (e) {}
        this._chartClickBound = false;
        this.fansChartInstance = null;
      }

      this.$nextTick(() => {
        requestAnimationFrame(() => {
          this.renderFansChart();
        });
      });
    },
    renderFansChart() {
      if (this.chartIsRendering) return;
      if (this.chartRenderQueue) {
        cancelAnimationFrame(this.chartRenderQueue);
      }
      this.chartRenderQueue = requestAnimationFrame(() =>
        this.executeChartRender()
      );
    },
    executeChartRender() {
      if (this.chartIsRendering) return;
      this.chartIsRendering = true;
      this.chartRenderQueue = null;

      const fullAccounts = this.chartUsersSorted;
      if (!fullAccounts.length) {
        if (this.fansChartInstance) {
          try {
            this.fansChartInstance.clear();
          } catch (e) {}
        }
        this.chartRenderedData = [];
        this.chartAccountUids = [];
        this.chartIsRendering = false;
        this.isChartLoadingMore = false;
        this.chartRenderQueue = null;
        this.isChartPrefetching = false;
        this.chartPendingLoadMoreNudge = false;
        return;
      }

      const preloadImages = (accounts) =>
        Promise.all(
          accounts.map((acc) => {
            if (!acc.avatar) return Promise.resolve(null);
            return new Promise((resolve) => {
              const img = new Image();
              img.onload = () => resolve(acc.avatar);
              img.onerror = () => resolve(null);
              img.src = acc.avatar;
            });
          })
        );

      const totalToShow = Math.min(
        this.chartBatchSize * this.chartCurrentBatch,
        fullAccounts.length
      );

      if (this._avatarsPreloadedCount < totalToShow) {
        const preloadBatchSize = 150;
        const newPreloadCount = Math.min(
          this._avatarsPreloadedCount + preloadBatchSize,
          totalToShow,
          fullAccounts.length
        );
        preloadImages(fullAccounts.slice(this._avatarsPreloadedCount, newPreloadCount)).finally(() => {
          this._avatarsPreloadedCount = newPreloadCount;
          this.chartIsRendering = false;
          this.chartRenderQueue = null;
          this.isChartPrefetching = false;
          this.renderFansChart();
        });
        return;
      }

      const accounts = fullAccounts.slice(0, totalToShow);

      const metricKey = this.chartMetricConfig.key || "followers";
      const data = accounts
        .map((account) => {
          const rawValue = account[metricKey];
          const numValue = Number(rawValue);
          const safeValue = Number.isFinite(numValue) ? numValue : 0;
          return {
            uid: account.uid,
            name: account.name || "-",
            value: safeValue,
            diff7d: account.diff7d ?? null,
            avatar: account.avatar || "",
          };
        })
        .filter((item) => item.value != null);

      this.chartRenderedData = data;
      this.chartAccountUids = data.map((item) => item.uid);

      const chartEl = document.getElementById("fans-chart");
      if (!chartEl) {
        this.chartIsRendering = false;
        this.isChartLoadingMore = false;
        this.chartRenderQueue = null;
        this.isChartPrefetching = false;
        this.pendingChartRender = true;
        this.chartPendingLoadMoreNudge = false;
        return;
      }
      if (chartEl.clientWidth === 0) {
        this.chartIsRendering = false;
        this.isChartLoadingMore = false;
        this.chartRenderQueue = null;
        this.isChartPrefetching = false;
        this.pendingChartRender = true;
        this.chartPendingLoadMoreNudge = false;
        setTimeout(() => {
          if (this.activeModule === "chart") {
            this.renderFansChart();
          }
        }, 100);
        return;
      }
      chartEl.style.cursor = "pointer";

      const dataLength = data.length;
      const BAR_HEIGHT = 32;
      const barWidth = 18;
      const barCategoryGap = "45%";
      const BASE_HEIGHT = 80;
      const chartHeight = Math.max(300, BASE_HEIGHT + dataLength * BAR_HEIGHT);
      chartEl.style.height = `${chartHeight}px`;
      chartEl.offsetHeight;
      this.attachChartDomListener(chartEl);

      if (!this.fansChartInstance) {
        this.fansChartInstance = echarts.init(chartEl, null, {
          renderer: "canvas",
          useDirtyRect: true,
        });
      }

      const isDark = this.currentTheme === "dark";
      const axisColor = isDark ? "#64748b" : "#94a3b8";
      const textColor = isDark ? "#f1f5f9" : "#111827";
      const splitColor = isDark
        ? "rgba(100,116,139,0.3)"
        : "rgba(0,0,0,0.05)";
      const metric = this.chartMetricConfig;
      const isMobile = window.innerWidth < 768;
      const axisLabelWidth = isMobile ? 150 : 200;
      const axisLabelMargin = 0;
      const computeNiceMax = (maxValue) => {
        if (!Number.isFinite(maxValue) || maxValue <= 0) return null;
        return maxValue * 1.05;
      };
      const dataMaxValue = data.reduce((m, item) => Math.max(m, item.value || 0), 0);
      const axisMax = computeNiceMax(dataMaxValue);

      const option = {
        backgroundColor: "transparent",
        animation: dataLength < 100,
        animationDuration: dataLength < 200 ? 300 : 0,
        grid: {
          left: 16,
          right: 24,
          top: 20,
          bottom: 20,
          containLabel: true,
        },
        tooltip: { show: false, trigger: "none", axisPointer: { show: false } },
        xAxis: {
          type: "value",
          position: "top",
          splitNumber: isMobile ? 3 : 4,
          max: axisMax,
          axisLine: { lineStyle: { color: axisColor } },
          axisLabel: {
            color: axisColor,
            fontSize: isMobile ? 10 : 12,
            interval: 0,
            formatter: (v) => {
              const n = Number(v) || 0;
              if (this.locale === 'en-US') {
                if (n >= 1e6) return (n / 1e6).toFixed(1).replace(/\.0$/, "") + "M";
                if (n >= 1e3) return (n / 1e3).toFixed(1).replace(/\.0$/, "") + "K";
                return n.toString();
              } else {
                if (n >= 1e8) return (n / 1e8).toFixed(1).replace(/\.0$/, "") + "亿";
                if (n >= 1e4) return (n / 1e4).toFixed(1).replace(/\.0$/, "") + "万";
                return n.toString();
              }
            },
          },
          splitLine: {
            show: true,
            lineStyle: { color: splitColor },
          },
        },
        yAxis: {
          type: "category",
          inverse: true,
          data: data.map((item) => item.name),
          axisLine: { show: false },
          axisTick: { show: false },
          triggerEvent: true,
          axisLabel: {
            formatter: (value, idx) => {
              const row = data[idx];
              if (!row) return value;
              const maxNameLength = isMobile ? 8 : 12;
              const displayName = value.length > maxNameLength
                ? value.substring(0, maxNameLength) + '...'
                : value;
              if (row.avatar) {
                return `{av${idx}|}{gap|}{txt|${displayName}}`;
              }
              return `{noav|}{gap|}{txt|${displayName}}`;
            },
            rich: (() => {
              const cfg = {
                txt: {
                  fontSize: 13,
                  color: textColor,
                  align: "left",
                  verticalAlign: "middle",
                  lineHeight: 26,
                  width: isMobile ? 90 : 130,
                },
                gap: {
                  width: 6,
                  height: 26,
                },
                noav: {
                  width: 26,
                  height: 26,
                  backgroundColor: "transparent",
                  verticalAlign: "middle",
                },
              };
              data.forEach((item, idx) => {
                if (item.avatar) {
                  cfg[`av${idx}`] = {
                    width: 26,
                    height: 26,
                    backgroundColor: { image: item.avatar },
                    borderRadius: 13,
                    verticalAlign: "middle",
                  };
                }
              });
              return cfg;
            })(),
            margin: 8,
            align: "right",
            verticalAlign: "middle",
            width: isMobile ? 130 : 170,
          },
        },
        series: [
          {
            type: "bar",
            data: data,
            barWidth,
            barCategoryGap,
            itemStyle: {
              color: metric.color,
              borderRadius: [0, 6, 6, 0],
            },
            emphasis: {
              disabled: true,
            },
            label: {
              show: true,
              position: "right",
              color: textColor,
              fontSize: 11,
              formatter: (p) => formatNumber(p.value ?? 0, this.locale),
            },
          },
        ],
      };

      try {
        this.fansChartInstance.setOption(option, {
          notMerge: true,
          lazyUpdate: false,
        });
      } catch (e) {
        this.chartIsRendering = false;
        this.isChartLoadingMore = false;
        this.chartRenderQueue = null;
        this.isChartPrefetching = false;
        this.chartPendingLoadMoreNudge = false;
        return;
      }

      if (!this._chartClickBound && this.fansChartInstance) {
        this._chartClickBound = true;
        this.fansChartInstance.on("click", (params) => {
          if (params && params.componentType === "series") {
            const idx = params.dataIndex;
            const item = this.chartRenderedData[idx];
            if (item && item.uid) {
              this.scrollToCard(item.uid);
            }
          }
        });
      }

      try {
        this.fansChartInstance.resize();
      } catch (e) {}

      this.chartIsRendering = false;
      this.isChartLoadingMore = false;
      this.chartRenderQueue = null;
      this.isChartPrefetching = false;
      requestAnimationFrame(() => {
        this.nudgeChartScrollAfterLoadMore(chartEl);
      });
      this.scheduleChartPrefetch(fullAccounts, totalToShow);
    },
    attachChartDomListener(chartEl) {
      if (!chartEl || this.chartDomListener) return;
      this.chartContainerEl = chartEl;
      this.chartDomListener = (event) => this.onChartContainerClick(event);
      chartEl.addEventListener("click", this.chartDomListener);
    },
    cleanupChartDomListener() {
      if (this.chartContainerEl && this.chartDomListener) {
        this.chartContainerEl.removeEventListener(
          "click",
          this.chartDomListener
        );
      }
      this.chartDomListener = null;
      this.chartContainerEl = null;
    },
    onChartContainerClick(event) {
      if (!event || !this.chartRenderedData.length) return;
      const chartEl = this.chartContainerEl || document.getElementById("fans-chart");
      if (!chartEl || !this.fansChartInstance) return;
      const rect = chartEl.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      if (!this.fansChartInstance.containPixel({ gridIndex: 0 }, [x, y])) return;
      let index = NaN;
      try {
        const dataPoint = this.fansChartInstance.convertFromPixel(
          { seriesIndex: 0 },
          [x, y]
        );
        if (Array.isArray(dataPoint) && dataPoint.length >= 2) {
          index = Math.floor(dataPoint[1]);
        }
      } catch (e) {}
      if (Number.isNaN(index) || index < 0 || index >= this.chartRenderedData.length) {
        const BAR_HEIGHT = 32;
        const GRID_TOP = 20;
        const roughIndex = Math.floor((y - GRID_TOP) / BAR_HEIGHT);
        if (roughIndex >= 0 && roughIndex < this.chartRenderedData.length) {
          index = roughIndex;
        } else {
          return;
        }
      }
      index = Math.min(Math.max(index, 0), this.chartRenderedData.length - 1);
      const item = this.chartRenderedData[index];
      if (item && item.uid) {
        this.scrollToCard(item.uid);
      }
    },
    handleChartScroll() {
      const now = Date.now();
      if (now - this.lastChartScrollTs < 180) return;
      this.lastChartScrollTs = now;
      if (this.chartIsRendering) return;
      if (this.chartRenderQueue) return;
      if (this.isChartLoadingMore) return;
      if (this.activeModule !== "chart") return;
      const chartEl = document.getElementById("fans-chart");
      if (!chartEl) return;
      const rect = chartEl.getBoundingClientRect();
      const viewportHeight =
        window.innerHeight || document.documentElement.clientHeight || 0;
      const threshold = Math.min(400, Math.max(200, rect.height * 0.2));
      if (rect.bottom - viewportHeight < threshold) {
        const totalData = this.chartUsersSorted.length;
        const currentShown =
          this.chartRenderedData.length || this.chartBatchSize * this.chartCurrentBatch;
        if (currentShown < totalData) {
          this.isChartLoadingMore = true;
          this.chartPendingLoadMoreNudge = true;
          this.chartCurrentBatch += 1;
          if (this.fansChartInstance) {
            try {
              this.fansChartInstance.dispose();
            } catch (e) {}
            this.fansChartInstance = null;
            this._chartClickBound = false;
          }
          this.renderFansChart();
        }
      }
    },
  },
};
