import { smoothScroll } from "../utils/helpers.js";

export const cardsMixin = {
  data() {
    return {
      searchQuery: "",
      highlightedUid: null,
      hiddenUids: [],
      cardInitialLimit: 40,
      cardStep: 40,
      cardRenderLimit: 40,
    };
  },
  computed: {
    filteredAccounts() {
      const query = this.searchQuery.trim().toLowerCase();
      if (!query) return this.users;
      return this.users.filter((account) => {
        const haystack = `${account.name || ""} ${account.uid}`.toLowerCase();
        return haystack.includes(query);
      });
    },
    pagedAccounts() {
      return this.filteredAccounts.slice(0, this.cardRenderLimit);
    },
    visibleAccounts() {
      return this.filteredAccounts.filter(
        (account) => !this.hiddenUids.includes(account.uid)
      );
    },
  },
  watch: {
    filteredAccounts: {
      handler(newVal) {
        const nextLimit = Math.min(this.cardInitialLimit, newVal.length);
        this.cardRenderLimit = nextLimit;
      },
    },
  },
  methods: {
    formatNumberValue(value) {
      if (value === null || value === undefined || Number.isNaN(value)) {
        return "-";
      }
      const numeric = Number(value);
      if (Number.isNaN(numeric)) return "-";


      if (this.locale === "zh-CN" || this.locale === "zh-Hant" || this.locale === "ja-JP") {
        const hundredMillionUnit = this.locale === "ja-JP" ? "億" : "亿";
        if (numeric >= 100000000) {
          return (numeric / 100000000).toFixed(1).replace(".0", "") + hundredMillionUnit;
        }
        if (numeric >= 10000) {
          return (numeric / 10000).toFixed(1).replace(".0", "") + "万";
        }
      } else {
        
        if (numeric >= 1000000) {
          return (numeric / 1000000).toFixed(1).replace('.0', '') + 'm';
        }
        if (numeric >= 1000) {
          return (numeric / 1000).toFixed(1).replace('.0', '') + 'k';
        }
      }

      return numeric.toLocaleString();
    },
    shuffleUsers() {
      this.users = [...this.users]
        .map((user) => ({ sortKey: Math.random(), user }))
        .sort((a, b) => a.sortKey - b.sortKey)
        .map((item) => item.user);
    },
    isHidden(uid) {
      return this.hiddenUids.includes(uid);
    },
    toggleUserVisibility(uid) {
      if (this.isHidden(uid)) {
        this.hiddenUids = this.hiddenUids.filter((item) => item !== uid);
      } else {
        this.hiddenUids = [...this.hiddenUids, uid];
      }
    },
    highlightUid(uid) {
      this.highlightedUid = uid;
    },
    scrollToCard(uid) {
      this.highlightUid(uid);
      const ensureRenderedAndScroll = () => {
        const index = this.filteredAccounts.findIndex(
          (account) => String(account.uid) === String(uid)
        );
        if (index !== -1 && this.cardRenderLimit < index + 1) {
          this.cardRenderLimit = index + 1;
        }
        this.$nextTick(() => smoothScroll(`#card-${uid}`));
      };
      if (this.activeModule !== "cards") {
        this.setActiveModule("cards");
        this.$nextTick(ensureRenderedAndScroll);
      } else {
        ensureRenderedAndScroll();
      }
    },
    handleCardScroll() {
      if (
        this.activeModule !== "cards" ||
        this.cardRenderLimit >= this.filteredAccounts.length
      ) {
        return;
      }
      const grid = document.getElementById("cards-grid");
      if (!grid) return;
      const rect = grid.getBoundingClientRect();
      const viewportHeight =
        window.innerHeight || document.documentElement.clientHeight || 0;
      const threshold = 480;
      if (rect.bottom - viewportHeight < threshold) {
        const next = Math.min(
          this.cardRenderLimit + this.cardStep,
          this.filteredAccounts.length
        );
        if (next !== this.cardRenderLimit) {
          this.cardRenderLimit = next;
        }
      }
    },
  },
};
