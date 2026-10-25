import { escapeHtml, copyToClipboard } from "../utils/helpers.js";
import { loadSecureData } from "../utils/dataLoader.js";
import { COPY_FEEDBACK_DELAY, COPY_RESET_DELAY, PASTEL_GRADIENTS } from "../utils/constants.js";

const MEETUPS_DATA_URL = "./data/meetups.json";
const MEETUPS_MAP_GEOJSON_URL = "./data/maps/china_provinces.geojson";

function pad2(value) {
  return String(value).padStart(2, "0");
}

function normalizeRegionName(name) {
  return String(name || "")
    .trim()
    .replace(/\s+/g, "")
    .replace(/特别行政区$/u, "")
    .replace(/维吾尔自治区$/u, "")
    .replace(/壮族自治区$/u, "")
    .replace(/回族自治区$/u, "")
    .replace(/自治区$/u, "")
    .replace(/省$/u, "")
    .replace(/市$/u, "");
}

const REGION_SUFFIX_RE = /(省|市|自治区|特别行政区|盟|地区)$/u;
const MUNICIPALITIES = new Set(["北京", "天津", "上海", "重庆"]);
const SPECIAL_REGIONS = new Set(["香港", "澳门"]);
const AUTONOMOUS_REGIONS = new Set(["内蒙古", "广西", "西藏", "宁夏", "新疆"]);

function parseMeetupDate(raw, defaultYear) {
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const normalized = trimmed
    .replace(/[年/.]/g, "-")
    .replace(/月/g, "-")
    .replace(/日/g, "")
    .replace(/\s+/g, "");

  let match = normalized.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (match) {
    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    if (month < 1 || month > 12 || day < 1 || day > 31) return null;
    return {
      year,
      month,
      day,
      ymd: `${year}-${pad2(month)}-${pad2(day)}`,
    };
  }

  match = normalized.match(/^(\d{1,2})-(\d{1,2})$/);
  if (match) {
    const year = Number(defaultYear);
    const month = Number(match[1]);
    const day = Number(match[2]);
    if (!year || month < 1 || month > 12 || day < 1 || day > 31) return null;
    return {
      year,
      month,
      day,
      ymd: `${year}-${pad2(month)}-${pad2(day)}`,
    };
  }

  return null;
}

function dayNumberFromYmd(ymd) {
  const match = String(ymd || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  return Math.floor(Date.UTC(year, month - 1, day) / 86400000);
}

function parseYmdParts(ymd) {
  const match = String(ymd || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  return {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
  };
}

function addDaysToYmd(ymd, daysToAdd) {
  const match = String(ymd || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  const delta = Number(daysToAdd || 0);
  if (!Number.isFinite(delta)) return null;
  date.setUTCDate(date.getUTCDate() + delta);
  const y = date.getUTCFullYear();
  const m = date.getUTCMonth() + 1;
  const d = date.getUTCDate();
  return `${y}-${pad2(m)}-${pad2(d)}`;
}

function parseDurationDays(value) {
  if (value == null) return null;
  const num = typeof value === "string" ? Number(value.trim()) : Number(value);
  if (!Number.isFinite(num)) return null;
  const intVal = Math.floor(num);
  if (intVal < 1) return null;
  return Math.min(intVal, 60);
}

export const meetupsMixin = {
  data() {
    return {
      meetupsStatus: "ready",
      loadingMeetups: false,
      meetupsLoadError: null,
      meetups: [],
      meetupsLastUpdated: null,

      meetupsView: "cards",
      meetupsSearchQuery: "",
      selectedMeetupsProvince: "__ALL__",
      selectedMeetupsProvinceFromMap: null,
      showPastMeetups: false,
      showMeetupsProvinceFilter: false,
      meetupsCopiedId: null,
      meetupsCopiedAt: 0,
      pastelGradients: PASTEL_GRADIENTS,
      meetupsCalendar: {
        year: null,
        month: null,
        daysInMonth: 30,
        firstDayWeek: 0,
        cells: [],
      },
      meetupsModal: {
        open: false,
        year: null,
        month: null,
        day: null,
        meetups: [],
      },
      meetupsMap: {
        status: "idle",
        error: null,
        geojson: null,
        instance: null,
        resizeObserver: null,
        nameMap: null,
        topRegions: [],
      },
    };
  },
  props: {
    activeModule: String,
  },
  computed: {
    meetupsTitle() {
      return this.strings.buttonMeetups;
    },
    meetupsViews() {
      return [
        {
          key: "calendar",
          label: this.strings.meetupsViewCalendar,
          icon: "🗓️",
        },
        {
          key: "map",
          label: this.strings.meetupsViewMap,
          icon: "🗺️",
        },
        {
          key: "cards",
          label: this.strings.meetupsViewCards,
          icon: "🎫",
        },
      ];
    },
    meetupsTodayYmd() {
      const now = new Date();
      const bj = new Date(now.getTime() + 8 * 60 * 60 * 1000);
      const year = bj.getUTCFullYear();
      const month = bj.getUTCMonth() + 1;
      const day = bj.getUTCDate();
      return `${year}-${pad2(month)}-${pad2(day)}`;
    },
    meetupsTodayParts() {
      const match = this.meetupsTodayYmd.match(/^(\d{4})-(\d{2})-(\d{2})$/);
      if (!match) return { year: null, month: null, day: null };
      return { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) };
    },
    meetupsProvinces() {
      const provinces = new Set();
      for (const meetup of this.meetups || []) {
        const province = meetup.province || meetup.city || "";
        if (province) provinces.add(province);
      }
      return ["__ALL__", ...Array.from(provinces).sort((a, b) => a.localeCompare(b, "zh-CN"))];
    },
    meetupsFilteredBase() {
      let list = Array.isArray(this.meetups) ? [...this.meetups] : [];
      const targetProvince = this.selectedMeetupsProvinceFromMap || this.selectedMeetupsProvince;
      if (targetProvince && targetProvince !== "__ALL__") {
        const targetNormalized = normalizeRegionName(targetProvince);
        list = list.filter((m) => {
          const province = m.province || m.city || "";
          const provinceMap = m.province_map || province;
          const normalizedProvince = normalizeRegionName(provinceMap || province);
          if (targetNormalized && normalizedProvince) {
            if (normalizedProvince === targetNormalized) return true;
          }
          return province === targetProvince ||
            provinceMap === targetProvince ||
            province.includes(targetProvince) ||
            provinceMap.includes(targetProvince);
        });
      }

      const query = (this.meetupsSearchQuery || "").trim().toLowerCase();
      if (query) {
        list = list.filter((m) => {
          return String(m.name || "").toLowerCase().includes(query);
        });
      }

      list.sort((a, b) => String(a.ymd || "").localeCompare(String(b.ymd || "")) || String(a.name || "").localeCompare(String(b.name || ""), "zh-CN"));
      return list;
    },
    filteredMeetups() {
      let list = this.meetupsFilteredBase;

      if (!this.showPastMeetups) {
        list = list.filter((m) => (m.ymd_end || m.ymd) && (m.ymd_end || m.ymd) >= this.meetupsTodayYmd);
      }

      return list;
    },
    nextBigMeetup() {

      if (!this.filteredMeetups || !this.filteredMeetups.length) return null;





      const candidates = this.filteredMeetups.filter(m => m.status === 'upcoming' || m.status === 'ongoing');
      if (candidates.length > 0) {

        return candidates[0];
      }


      return this.filteredMeetups[0];
    },
    meetupsCalendarGrouped() {
      const map = new Map();
      const year = this.meetupsCalendar.year;
      const month = this.meetupsCalendar.month;
      if (!year || !month) return map;

      const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
      const monthStartYmd = `${year}-${pad2(month)}-01`;
      const monthStartNum = dayNumberFromYmd(monthStartYmd);
      const monthEndNum = dayNumberFromYmd(`${year}-${pad2(month)}-${pad2(daysInMonth)}`);
      if (monthStartNum == null || monthEndNum == null) return map;

      for (const meetup of this.meetupsFilteredBase) {
        const startNum = dayNumberFromYmd(meetup.ymd);
        const endNum = dayNumberFromYmd(meetup.ymd_end || meetup.ymd);
        if (startNum == null || endNum == null) continue;
        const from = Math.max(startNum, monthStartNum);
        const to = Math.min(endNum, monthEndNum);
        if (from > to) continue;
        for (let n = from; n <= to; n += 1) {
          const day = n - monthStartNum + 1;
          if (day < 1 || day > daysInMonth) continue;
          const list = map.get(day) || [];
          list.push(meetup);
          map.set(day, list);
        }
      }

      for (const [day, list] of map.entries()) {
        list.sort((a, b) => String(a.name || "").localeCompare(String(b.name || ""), "zh-CN"));
        map.set(day, list);
      }

      return map;
    },
    meetupsWeekdays() {
      return this.strings.birthdaysWeekdays || ["日", "一", "二", "三", "四", "五", "六"];
    },
    upcomingMeetupsCount() {
      return (this.meetups || []).filter((m) => (m.ymd_end || m.ymd) && (m.ymd_end || m.ymd) >= this.meetupsTodayYmd).length;
    },
    totalMeetupsCount() {
      return (this.meetups || []).length;
    },
    meetupsRegionCount() {
      const today = this.meetupsTodayYmd;
      const unique = new Set();
      const list = this.filteredMeetups || [];
      for (const m of list) {

        if (m.isChina && (m.ymd_end || m.ymd) >= today && m.province_map) {
          unique.add(normalizeRegionName(m.province_map));
        }
      }
      return unique.size;
    },
  },
  methods: {
    async loadMeetups() {
      if (this.loadingMeetups) return;
      this.loadingMeetups = true;
      this.meetupsLoadError = null;
      try {
        const data = await loadSecureData(MEETUPS_DATA_URL, { cache: "no-store" });
        const rawMeetups = Array.isArray(data.meetups) ? data.meetups : [];
        this.meetupsLastUpdated = data.meta?.lastUpdated || null;

        const defaultYear = this.meetupsTodayParts.year || new Date().getFullYear();
        const normalized = [];
        for (const item of rawMeetups) {
          if (!item) continue;
          const name = String(item.name || "").trim();
          const city = String(item.city || "").trim();
          const province = String(item.province || "").trim();
          const country = item.country != null ? String(item.country).trim() : "";
          const district = item.district != null ? String(item.district).trim() : "";
          const qq_group = item.qq_group != null ? String(item.qq_group).trim() : "";
          const logo = item.logo ? String(item.logo).trim() : null;
          const website = item.website ? String(item.website).trim() : "";
          const parsed = parseMeetupDate(item.date, defaultYear);
          if (!parsed || !name) continue;

          const isChina =
            !country ||
            country === "China" ||
            country === "CN" ||
            country === "中国" ||
            country === "中华人民共和国";
          const provinceForMap = isChina ? province || city || "" : "";

          const id =
            String(item.id || "").trim() ||
            `${name}-${parsed.ymd}-${city || province || "unknown"}`;

          const todayNum = dayNumberFromYmd(this.meetupsTodayYmd);
          const startNum = dayNumberFromYmd(parsed.ymd);

          let durationDays = parseDurationDays(item.duration_days) || 1;
          const parsedEnd = parseMeetupDate(item.end_date, defaultYear);
          if (parsedEnd && startNum != null) {
            const endCandidateNum = dayNumberFromYmd(parsedEnd.ymd);
            if (endCandidateNum != null && endCandidateNum >= startNum) {
              durationDays = Math.min(endCandidateNum - startNum + 1, 60);
            }
          }

          const ymd_end = addDaysToYmd(parsed.ymd, durationDays - 1) || parsed.ymd;
          const endNum = dayNumberFromYmd(ymd_end);
          const daysToStart =
            todayNum != null && startNum != null ? startNum - todayNum : null;
          const daysToEnd =
            todayNum != null && endNum != null ? endNum - todayNum : null;

          let status = "unknown";
          let daysUntil = null;
          if (daysToEnd != null && daysToEnd < 0) status = "ended";
          else if (daysToStart != null && daysToStart > 0) {
            status = "upcoming";
            daysUntil = daysToStart;
          }
          else if (daysToStart != null && daysToEnd != null) status = "ongoing";

          normalized.push({
            id,
            name,
            ymd: parsed.ymd,
            ymd_end,
            duration_days: durationDays,
            year: parsed.year,
            month: parsed.month,
            day: parsed.day,
            country,
            city,
            province: province || city || "",
            district,
            website,
            isChina,
            province_map: provinceForMap,
            qq_group,
            logo,
            daysToStart,
            daysToEnd,
            status,
            daysUntil,
          });
        }

        normalized.sort((a, b) => String(a.ymd).localeCompare(String(b.ymd)));
        this.meetups = normalized;

        this.initMeetupsCalendar();
        if (this.activeModule === "meetups" && this.meetupsView === "map") {
          this.$nextTick(() => this.renderMeetupsMap());
        }
      } catch (err) {
        console.warn("[meetups] load failed:", err);
        this.meetupsLoadError = this.strings.loadMeetupsFailed || "Failed to load meetups";
        this.meetups = [];
        this.initMeetupsCalendar();
      } finally {
        this.loadingMeetups = false;
      }
    },
    initMeetupsCalendar() {
      const { year, month } = this.meetupsTodayParts;
      if (!year || !month) return;
      if (!this.meetupsCalendar.year || !this.meetupsCalendar.month) {
        this.meetupsCalendar.year = year;
        this.meetupsCalendar.month = month;
      }
      this.updateMeetupsCalendar();
    },
    updateMeetupsCalendar() {
      if (!this.meetupsCalendar.year || !this.meetupsCalendar.month) return;
      const daysInMonth = new Date(Date.UTC(this.meetupsCalendar.year, this.meetupsCalendar.month, 0)).getUTCDate();
      const firstDayWeek = new Date(Date.UTC(this.meetupsCalendar.year, this.meetupsCalendar.month - 1, 1)).getUTCDay();
      this.meetupsCalendar.daysInMonth = daysInMonth;
      this.meetupsCalendar.firstDayWeek = firstDayWeek;
      this.buildMeetupsCells();
    },
    changeMeetupsMonth(offset) {
      let newMonth = this.meetupsCalendar.month + offset;
      let newYear = this.meetupsCalendar.year;

      if (newMonth > 12) {
        newMonth = 1;
        newYear += 1;
      } else if (newMonth < 1) {
        newMonth = 12;
        newYear -= 1;
      }

      this.meetupsCalendar.month = newMonth;
      this.meetupsCalendar.year = newYear;
      this.updateMeetupsCalendar();
    },
    buildMeetupsCells() {
      const placeholders = Array.from({ length: this.meetupsCalendar.firstDayWeek || 0 }).map(() => ({ type: "empty" }));
      const monthMeetups = this.meetupsCalendarGrouped;
      const today = this.meetupsTodayParts;

      const dayCells = Array.from({ length: this.meetupsCalendar.daysInMonth || 0 }).map((_, idx) => {
        const dayNumber = idx + 1;
        const meetups = monthMeetups.get(dayNumber) || [];
        const hasUpcoming = meetups.some((m) => (m.ymd_end || m.ymd) && (m.ymd_end || m.ymd) >= this.meetupsTodayYmd);


        const enhancedMeetups = meetups.map(m => {
          const endDate = m.ymd_end || m.ymd;
          const isPast = endDate < this.meetupsTodayYmd;
          return { ...m, isPast };
        });

        return {
          type: "day",
          day: dayNumber,
          meetups: enhancedMeetups,
          isToday:
            this.meetupsCalendar.year === today.year &&
            this.meetupsCalendar.month === today.month &&
            dayNumber === today.day,
          hasUpcoming,
        };
      });

      this.meetupsCalendar.cells = [...placeholders, ...dayCells];
    },
    openMeetupsModal(day, meetups) {
      if (!meetups || !meetups.length) return;
      this.meetupsModal = {
        open: true,
        year: this.meetupsCalendar.year,
        month: this.meetupsCalendar.month,
        day,
        meetups: [...meetups].sort((a, b) => String(a.name || "").localeCompare(String(b.name || ""), "zh-CN")),
      };
    },
    closeMeetupsModal() {
      this.meetupsModal = {
        open: false,
        year: null,
        month: null,
        day: null,
        meetups: [],
      };
    },
    formatMeetupsRegionLabel(value) {
      const raw = String(value || "").trim();
      if (!raw) return raw;
      if (raw === "__ALL__") return this.strings.provinceAll || "全部";
      if (REGION_SUFFIX_RE.test(raw)) return raw;
      const normalized = normalizeRegionName(raw);
      if (!normalized) return raw;
      const nameMap = this.meetupsMap?.nameMap;
      if (nameMap && nameMap.has(normalized)) {
        return nameMap.get(normalized);
      }
      if (MUNICIPALITIES.has(normalized)) return `${normalized}市`;
      if (SPECIAL_REGIONS.has(normalized)) return `${normalized}特别行政区`;
      if (AUTONOMOUS_REGIONS.has(normalized)) return `${normalized}自治区`;
      return `${normalized}省`;
    },
    formatMeetupDate(ymd) {
      const match = String(ymd || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
      if (!match) return String(ymd || "");
      return `${match[1]}.${match[2]}.${match[3]}`;
    },
    formatMeetupDateRange(meetup) {
      if (!meetup) return "";
      const start = meetup.ymd;
      const end = meetup.ymd_end || meetup.ymd;
      if (!start) return "";

      const startParts = parseYmdParts(start);
      if (!startParts) return this.formatMeetupDate(start);


      const currentYear = new Date().getFullYear();
      const hideYear = startParts.year === currentYear;

      if (this.locale === "zh-CN" || this.locale === "zh-Hant") {
        if (!end || end === start) {
          return `${startParts.month}月${startParts.day}日`;
        }
        const endParts = parseYmdParts(end);
        if (!endParts) {
          return `${this.formatMeetupDate(start)} - ${this.formatMeetupDate(end)}`;
        }
        const sameYear = startParts.year === endParts.year;
        const sameMonth = sameYear && startParts.month === endParts.month;
        if (sameMonth) {
          return `${startParts.month}月${startParts.day}日 - ${endParts.day}日`;
        }
        if (sameYear) {
          return `${startParts.month}月${startParts.day}日 - ${endParts.month}月${endParts.day}日`;
        }
        return `${startParts.month}月${startParts.day}日 - ${endParts.month}月${endParts.day}日`;
      }

      if (this.locale === "ja-JP") {
        const formatJa = (y, m, d, showYear) =>
          showYear ? `${y}年${m}月${d}日` : `${m}月${d}日`;

        if (!end || end === start) {
          return formatJa(startParts.year, startParts.month, startParts.day, !hideYear);
        }

        const endParts = parseYmdParts(end);
        if (!endParts) {
          return `${this.formatMeetupDate(start)} - ${this.formatMeetupDate(end)}`;
        }

        const sameYear = startParts.year === endParts.year;
        const sameMonth = sameYear && startParts.month === endParts.month;
        const yearPrefix = hideYear ? "" : `${startParts.year}年`;

        if (sameYear) {
          if (sameMonth) {
            return hideYear
              ? `${startParts.month}月${startParts.day}日〜${endParts.day}日`
              : `${yearPrefix}${startParts.month}月${startParts.day}日〜${endParts.day}日`;
          }

          return hideYear
            ? `${startParts.month}月${startParts.day}日〜${endParts.month}月${endParts.day}日`
            : `${yearPrefix}${startParts.month}月${startParts.day}日〜${endParts.month}月${endParts.day}日`;
        }

        return `${formatJa(startParts.year, startParts.month, startParts.day, true)}〜${formatJa(endParts.year, endParts.month, endParts.day, true)}`;
      }



      const formatEn = (y, m, d, showYear) => {
        const mon = this.strings.monthsShort ? this.strings.monthsShort[m - 1] : m;
        return showYear ? `${mon} ${d}, ${y}` : `${mon} ${d}`;
      };

      if (!end || end === start) {
        return formatEn(startParts.year, startParts.month, startParts.day, !hideYear);
      }

      const endParts = parseYmdParts(end);
      if (!endParts) {
        return `${this.formatMeetupDate(start)} - ${this.formatMeetupDate(end)}`;
      }

      const sameYear = startParts.year === endParts.year;
      const sameMonth = sameYear && startParts.month === endParts.month;


      const startStr = formatEn(startParts.year, startParts.month, startParts.day, !hideYear && !sameYear);


      let endStr = "";
      if (sameMonth) {
        endStr = `${endParts.day}`;
      } else if (sameYear) {
        const mon = this.strings.monthsShort ? this.strings.monthsShort[endParts.month - 1] : endParts.month;
        endStr = `${mon} ${endParts.day}`;
      } else {
        endStr = formatEn(endParts.year, endParts.month, endParts.day, !hideYear);
      }







      if (sameYear) {
        const monStart = this.strings.monthsShort ? this.strings.monthsShort[startParts.month - 1] : startParts.month;
        const yearSuffix = hideYear ? "" : `, ${startParts.year}`;

        if (sameMonth) {
          return `${monStart} ${startParts.day}-${endParts.day}${yearSuffix}`;
        } else {
          const monEnd = this.strings.monthsShort ? this.strings.monthsShort[endParts.month - 1] : endParts.month;
          return `${monStart} ${startParts.day} - ${monEnd} ${endParts.day}${yearSuffix}`;
        }
      }


      return `${formatEn(startParts.year, startParts.month, startParts.day, !hideYear)} - ${formatEn(endParts.year, endParts.month, endParts.day, true)}`;
    },

    meetupCountdownText(meetup) {
      if (meetup.status === 'upcoming') {
        if (this.locale === "zh-CN" || this.locale === "zh-Hant") return `${meetup.daysUntil}天后`;
        if (this.locale === "ja-JP") return `${meetup.daysUntil}日後`;
        return `In ${meetup.daysUntil}d`;
      }
      if (meetup.status === 'ongoing') {
        if (this.locale === "zh-CN" || this.locale === "zh-Hant") return this.locale === "zh-Hant" ? "進行中" : "进行中";
        if (this.locale === "ja-JP") return "開催中";
        return "Ongoing";
      }
      if (this.locale === "zh-CN" || this.locale === "zh-Hant") return this.locale === "zh-Hant" ? "已結束" : "已结束";
      if (this.locale === "ja-JP") return "終了";
      return "Ended";
    },


    getMeetupGradient(meetup) {
      if (meetup.status === 'ended') {
        return "bg-slate-200 dark:bg-slate-700";
      }
      const str = meetup.id || meetup.name;
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
      }
      const index = Math.abs(hash) % this.pastelGradients.length;
      return "bg-gradient-to-r " + this.pastelGradients[index];
    },
    async copyMeetupGroup(meetup) {
      const text = String(meetup?.qq_group || "").trim();
      if (!text) return;
      const ok = await copyToClipboard(text);
      if (!ok) return;
      this.meetupsCopiedId = meetup.id;
      this.meetupsCopiedAt = Date.now();
      window.setTimeout(() => {
        if (this.meetupsCopiedId === meetup.id && Date.now() - this.meetupsCopiedAt >= COPY_FEEDBACK_DELAY) {
          this.meetupsCopiedId = null;
        }
      }, COPY_RESET_DELAY);
    },
    downloadMeetupICS(meetup) {
      if (!meetup || !meetup.ymd) return;

      // Format date as iCalendar date (YYYYMMDD for all-day events)
      const formatICSDate = (ymd) => {
        return ymd.replace(/-/g, '');
      };

      // Calculate end date (add 1 day for all-day event end)
      const startYmd = meetup.ymd;
      const endYmd = meetup.ymd_end || meetup.ymd;
      const endDate = new Date(endYmd.replace(/-/g, '/'));
      endDate.setDate(endDate.getDate() + 1);
      const endICS = `${endDate.getFullYear()}${pad2(endDate.getMonth() + 1)}${pad2(endDate.getDate())}`;

      // Build location string
      const location = [meetup.city, meetup.province]
        .filter((s) => s && s.trim())
        .join(', ');

      // Build description
      let description = '';
      if (meetup.website) {
        description += `${this.strings?.websiteLabel || '官网'}: ${meetup.website}\n`;
      }
      if (meetup.qq_group) {
        description += `${this.strings?.qqGroupLabel || 'QQ群'}: ${meetup.qq_group}`;
      }

      // Generate unique ID
      const uid = `meetup-${meetup.id || meetup.name}-${startYmd}@furup.me`;

      // Build ICS content
      const icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//FurUp//Meetups//CN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'BEGIN:VEVENT',
        `UID:${uid}`,
        `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}`,
        `DTSTART;VALUE=DATE:${formatICSDate(startYmd)}`,
        `DTEND;VALUE=DATE:${endICS}`,
        `SUMMARY:${meetup.name}`,
        location ? `LOCATION:${location}` : '',
        description ? `DESCRIPTION:${description}` : '',
        meetup.website ? `URL:${meetup.website}` : '',
        'END:VEVENT',
        'END:VCALENDAR',
      ].filter(Boolean).join('\r\n');

      // Create and download file
      const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${meetup.name}.ics`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },
    downloadAllMeetupsICS() {
      const meetupsList = this.filteredMeetups || [];
      if (!meetupsList.length) return;

      // Format date as iCalendar date (YYYYMMDD for all-day events)
      const formatICSDate = (ymd) => ymd.replace(/-/g, '');

      // Build events array
      const events = [];
      for (const meetup of meetupsList) {
        if (!meetup.ymd) continue;

        const startYmd = meetup.ymd;
        const endYmd = meetup.ymd_end || meetup.ymd;
        const endDate = new Date(endYmd.replace(/-/g, '/'));
        endDate.setDate(endDate.getDate() + 1);
        const endICS = `${endDate.getFullYear()}${pad2(endDate.getMonth() + 1)}${pad2(endDate.getDate())}`;

        const location = [meetup.city, meetup.province]
          .filter((s) => s && s.trim())
          .join(', ');

        let description = '';
        if (meetup.website) description += `${this.strings?.websiteLabel || '官网'}: ${meetup.website}\n`;
        if (meetup.qq_group) description += `${this.strings?.qqGroupLabel || 'QQ群'}: ${meetup.qq_group}`;

        const uid = `meetup-${meetup.id || meetup.name}-${startYmd}@furup.me`;

        events.push([
          'BEGIN:VEVENT',
          `UID:${uid}`,
          `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}`,
          `DTSTART;VALUE=DATE:${formatICSDate(startYmd)}`,
          `DTEND;VALUE=DATE:${endICS}`,
          `SUMMARY:${meetup.name}`,
          location ? `LOCATION:${location}` : '',
          description ? `DESCRIPTION:${description}` : '',
          meetup.website ? `URL:${meetup.website}` : '',
          'END:VEVENT',
        ].filter(Boolean).join('\r\n'));
      }

      if (!events.length) return;

      const icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//FurUp//Meetups//CN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'X-WR-CALNAME:FurUp 兽聚日历',
        ...events,
        'END:VCALENDAR',
      ].join('\r\n');

      const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `FurUp_Meetups_${meetupsList.length}.ics`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },
    openMeetupWebsite(meetup) {
      const url = String(meetup?.website || "").trim();
      if (!url) return;
      if (/^https?:\/\//i.test(url)) {
        this.openExternal(url);
      }
    },
    getMeetupLinkTypeDisplay(meetup) {
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

      if (meetup?.link_type && types[meetup.link_type]) {
        const t = types[meetup.link_type];
        return { label: pickLabel(t) };
      }

      // URL-based fallback detection
      const url = meetup?.website || '';
      if (url.includes('bilibili.com')) return { label: pickLabel(types.bilibili) };
      if (url.includes('twitter.com') || url.includes('x.com')) return { label: types.x.label };
      if (url.includes('weibo.')) return { label: pickLabel(types.weibo) };
      if (url.includes('taobao.')) return { label: pickLabel(types.taobao) };
      if (url.includes('douyin.')) return { label: pickLabel(types.douyin) };
      if (url.includes('xiaohongshu.')) return { label: pickLabel(types.xiaohongshu) };

      return { label: pickLabel(types.website) };
    },
    async ensureMeetupsMap() {
      if (this.meetupsMap.status === "loading" || this.meetupsMap.status === "ready") {
        this.$nextTick(() => {
          this.initMeetupsMapObserver();
          this.renderMeetupsMap();
        });
        return;
      }

      if (!window.echarts) {
        this.meetupsMap.status = "error";
        this.meetupsMap.error = "ECharts not available";
        return;
      }

      this.meetupsMap.status = "loading";
      this.meetupsMap.error = null;
      try {
        const res = await fetch(MEETUPS_MAP_GEOJSON_URL);
        if (!res.ok) {
          this.meetupsMap.status = "missing";
          this.meetupsMap.error = `HTTP ${res.status}`;
          return;
        }
        const geojson = await res.json();
        if (!geojson || !Array.isArray(geojson.features)) {
          throw new Error("Invalid GeoJSON");
        }
        this.meetupsMap.geojson = geojson;

        const nameMap = new Map();
        for (const feature of geojson.features) {
          const props = feature?.properties || {};
          const candidateKeys = ["name", "NAME", "fullname", "fullName"];
          let name = "";
          for (const key of candidateKeys) {
            if (typeof props[key] === "string" && props[key].trim()) {
              name = props[key].trim();
              break;
            }
          }
          if (!name) {
            for (const val of Object.values(props)) {
              if (typeof val === "string" && val.trim()) {
                name = val.trim();
                break;
              }
            }
          }

          if (name && name !== "境界线") {
            nameMap.set(normalizeRegionName(name), name);
          }
        }
        this.meetupsMap.nameMap = nameMap;

        window.echarts.registerMap("china_provinces", geojson);
        this.meetupsMap.status = "ready";

        this.$nextTick(() => {
          this.initMeetupsMapObserver();
          this.renderMeetupsMap();
        });
      } catch (err) {
        console.warn("[meetups] map init failed:", err);
        this.meetupsMap.status = "error";
        this.meetupsMap.error = String(err?.message || err);
      }
    },
    initMeetupsMapObserver() {
      const el = document.getElementById("meetups-map");
      if (!el) return;

      if (this.meetupsMap.resizeObserver) {
        try {
          this.meetupsMap.resizeObserver.disconnect();
        } catch (e) { }
      }

      this.meetupsMap.resizeObserver = new ResizeObserver(() => {
        if (this.meetupsMap.instance) {
          try {
            this.meetupsMap.instance.resize();
          } catch (e) { }
        } else {
          this.renderMeetupsMap();
        }
      });
      this.meetupsMap.resizeObserver.observe(el);
    },
    renderMeetupsMap() {
      if (this.meetupsMap.status !== "ready") return;
      const el = document.getElementById("meetups-map");
      if (!el || !window.echarts) return;

      if (!this.meetupsMap.instance) {
        this.meetupsMap.instance = window.echarts.init(el, null, { renderer: "canvas" });

        this.meetupsMap.instance.resize();
      }

      const today = this.meetupsTodayYmd;
      const upcoming = (this.filteredMeetups || [])
        .filter((m) => (m.ymd_end || m.ymd) && (m.ymd_end || m.ymd) >= today)
        .filter((m) => m.isChina);

      const nameMap = this.meetupsMap.nameMap || new Map();
      const provinceMeetups = new Map();
      for (const meetup of upcoming) {
        const key = normalizeRegionName(meetup.province_map || "");
        const mapName = nameMap.get(key) || meetup.province_map || "";
        if (!mapName) continue;
        const list = provinceMeetups.get(mapName) || [];
        list.push(meetup);
        provinceMeetups.set(mapName, list);
      }



      const data = Array.from(provinceMeetups.entries()).map(([name, list]) => ({
        name,
        value: list.length,
      }));


      this.meetupsMap.topRegions = data
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);

      const maxValue = data.reduce((max, item) => Math.max(max, Number(item.value || 0)), 0) || 1;
      const isDark = this.currentTheme === "dark";


      const inRangeColors = isDark
        ? ["#451a03", "#78350f", "#b45309", "#d97706", "#ea580c"]
        : ["#fff7ed", "#fed7aa", "#fdba74", "#f97316", "#c2410c"];

      const textColor = isDark ? "#cbd5e1" : "#334155";
      const tooltipBg = isDark ? "rgba(43, 29, 26, 0.95)" : "rgba(255, 255, 255, 0.95)";

      const option = {
        tooltip: {
          trigger: "item",
          confine: true,
          padding: 0,
          backgroundColor: "transparent",
          borderColor: "transparent",
          borderWidth: 0,
          shadowBlur: 0,
          shadowOffsetX: 0,
          shadowOffsetY: 0,
          formatter: (params) => {
            const name = String(params?.name || "");
            if (!name || name === "境界线") return "";

            const value = Number(params?.value || 0);
            const list = provinceMeetups.get(name) || [];


            const title = name;
            const subtext = (this.locale === "zh-CN" || this.locale === "zh-Hant") ? `${value} 场兽聚` : `${value} Meetups`;


            const topLines = list
              .slice()
              .sort((a, b) => String(a.ymd || "").localeCompare(String(b.ymd || "")))
              .slice(0, 5)
              .map(m => {
                const dateStatus = m.status === 'upcoming'
                  ? `<span style="color: #ea580c; font-weight: bold;">●</span>`
                  : `<span style="color: #94a3b8;">●</span>`;
                return `
                  <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; font-size: 12px; margin-bottom: 4px;">
                    <span style="display: flex; align-items: center; gap: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 140px;">
                      ${dateStatus} ${escapeHtml(m.name)}
                    </span>
                    <span style="font-family: monospace; opacity: 0.7; font-size: 11px;">
                      ${escapeHtml(this.formatMeetupDateRange(m))}
                    </span>
                  </div>
                `;
              }).join("");

            const moreCount = list.length - 5;
            const moreText = moreCount > 0
              ? `<div style="text-align: center; font-size: 10px; opacity: 0.5; margin-top: 4px;">+${moreCount} more...</div>`
              : "";

            return `
              <div style="
                background: ${tooltipBg}; 
                border: 1px solid ${isDark ? "rgba(234, 88, 12, 0.2)" : "rgba(251, 146, 60, 0.3)"}; 
                border-radius: 12px; 
                padding: 12px; 
                box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
                color: ${textColor};
                font-family: sans-serif;
                min-width: 200px;
                backdrop-filter: blur(8px);
              ">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; padding-bottom: 8px; border-bottom: 1px solid ${isDark ? "rgba(234, 88, 12, 0.1)" : "rgba(251, 146, 60, 0.2)"};">
                  <span style="font-weight: bold; font-size: 14px;">${escapeHtml(title)}</span>
                  <span style="background: ${isDark ? "rgba(234, 88, 12, 0.2)" : "#fff7ed"}; color: #ea580c; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: bold;">${value}</span>
                </div>
                <div>
                  ${topLines || '<div style="opacity: 0.5; font-size: 12px;">No active meetups</div>'}
                  ${moreText}
                </div>
              </div>
            `;
          },
        },
        visualMap: {
          show: false,
          min: 0,
          max: maxValue,
          inRange: { color: inRangeColors },
          calculable: false,
        },
        geo: {
          map: "china_provinces",
          roam: "move",
          zoom: 1.35,
          center: [105, 36],
          scaleLimit: { min: 0.8, max: 3 },
          label: {
            show: false,
          },
          itemStyle: {

            borderColor: isDark ? "#57534e" : "#d6d3d1",
            borderWidth: 1,
            areaColor: isDark ? "#292524" : "#f5f5f4",
          },
          emphasis: {
            label: {
              show: true,
              color: isDark ? "#fff7ed" : "#7c2d12",
              fontWeight: "bold"
            },
            itemStyle: {
              areaColor: isDark ? "#ea580c" : "#fdba74",
              borderColor: isDark ? "#fb923c" : "#c2410c",
              borderWidth: 2,
              shadowBlur: 5,
              shadowColor: "rgba(0, 0, 0, 0.2)"
            }
          },
          select: {
            disabled: true
          }
        },
        series: [
          {
            type: "map",
            geoIndex: 0,
            data,
          },
        ],
      };

      this.meetupsMap.instance.setOption(option, true);


      this.meetupsMap.instance.off('click');
      this.meetupsMap.instance.on('click', (params) => {
        if (params.componentType === 'geo' || params.componentType === 'series') {
          const regionName = params.name;
          if (regionName && regionName !== "境界线") {
            this.handleMapClick(regionName);
          }
        }
      });


      this.$nextTick(() => {
        if (this.meetupsMap.instance) {
          this.meetupsMap.instance.resize();

          setTimeout(() => {
            if (this.meetupsMap.instance) {
              this.meetupsMap.instance.setOption(option, true);
            }
          }, 50);
        }
      });
    },
    handleMapClick(provinceName) {
      if (!provinceName) return;
      this.selectedMeetupsProvinceFromMap = provinceName;
      this.selectedMeetupsProvince = "__ALL__";

      this.meetupsView = 'cards';


      this.$nextTick(() => {
        const container = document.getElementById('meetups-cards-container');
        if (container) container.scrollIntoView({ behavior: 'smooth' });
      });
    },
    zoomInMap() {
      if (!this.meetupsMap.instance) return;
      const option = this.meetupsMap.instance.getOption();

      const currentZoom = (option.geo && option.geo[0]) ? option.geo[0].zoom : 1.35;
      const newZoom = Math.min(currentZoom * 1.2, 5);
      this.meetupsMap.instance.setOption({
        geo: { zoom: newZoom }
      });
    },
    zoomOutMap() {
      if (!this.meetupsMap.instance) return;
      const option = this.meetupsMap.instance.getOption();
      const currentZoom = (option.geo && option.geo[0]) ? option.geo[0].zoom : 1.35;
      const newZoom = Math.max(currentZoom / 1.2, 0.8);
      this.meetupsMap.instance.setOption({
        geo: { zoom: newZoom }
      });
    },
    resetMapZoom() {
      if (!this.meetupsMap.instance) return;
      this.meetupsMap.instance.setOption({
        geo: { zoom: 1.35, center: [105, 36] }
      });
    },
    disposeMeetupsMap() {
      if (this.meetupsMap.resizeObserver) {
        try {
          this.meetupsMap.resizeObserver.disconnect();
        } catch (e) { }
        this.meetupsMap.resizeObserver = null;
      }
      if (this.meetupsMap.instance) {
        try {
          this.meetupsMap.instance.dispose();
        } catch (e) { }
        this.meetupsMap.instance = null;
      }
    },
  },
  watch: {
    activeModule(newVal, oldVal) {
      if (newVal === "meetups" && !this.loadingMeetups) {
        this.loadMeetups();
      }
      if (newVal !== "meetups" && oldVal === "meetups") {
        this.disposeMeetupsMap();
      }
      if (newVal === "meetups" && this.meetupsView === "map") {
        this.$nextTick(() => this.ensureMeetupsMap());
      }
    },
    meetupsView(newVal) {
      if (this.activeModule !== "meetups") return;
      if (newVal === "map") {
        this.$nextTick(() => this.ensureMeetupsMap());
      } else {
        this.disposeMeetupsMap();
      }
      if (newVal === "calendar") {
        this.$nextTick(() => this.initMeetupsCalendar());
      }
    },
    currentTheme() {
      if (this.activeModule === "meetups" && this.meetupsView === "map") {
        this.$nextTick(() => this.renderMeetupsMap());
      }
    },
    selectedMeetupsProvince() {

      this.selectedMeetupsProvinceFromMap = null;
      if (this.meetupsView === "calendar") {
        this.updateMeetupsCalendar();
      }
      if (this.meetupsView === "map") {
        this.renderMeetupsMap();
      }
    },
    showPastMeetups() {
      if (this.meetupsView === "calendar") {
        this.updateMeetupsCalendar();
      }
      if (this.meetupsView === "map") {
        this.renderMeetupsMap();
      }
    },
    meetupsSearchQuery() {
      if (this.meetupsView === "calendar") {
        this.updateMeetupsCalendar();
      }
      if (this.meetupsView === "map") {
        this.renderMeetupsMap();
      }
    },
  },
  mounted() {
    this.selectedMeetupsProvince = "__ALL__";
    const handler = () => {
      if (document.hidden) return;
      if (this.activeModule === "meetups" && !this.loadingMeetups) {
        this.loadMeetups();
      }
    };
    this._meetupsVisibilityHandler = handler;
    document.addEventListener("visibilitychange", handler);
    if (this.activeModule === "meetups") {
      this.loadMeetups();
    }
  },
  beforeUnmount() {
    if (this._meetupsVisibilityHandler) {
      document.removeEventListener("visibilitychange", this._meetupsVisibilityHandler);
      this._meetupsVisibilityHandler = null;
    }
    this.disposeMeetupsMap();
  },
};
