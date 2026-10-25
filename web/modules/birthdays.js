export const birthdaysMixin = {
  data() {
    return {
      birthdayProfiles: [],
      birthdaysSearchQuery: "",
      birthdayCalendar: {
        year: null,
        month: null,
        daysInMonth: 30,
        firstDayWeek: 0,
        cells: [],
      },
      birthdayModal: {
        open: false,
        month: null,
        day: null,
        users: [],
      },
      todayBirthdays: [],
      todayMaxList: 20,
      birthdayAutoJumping: false,
      birthdayAutoJumpTimer: null,
    };
  },
  computed: {
    birthdayTitleText() {
      if (!this.birthdayCalendar.year || !this.birthdayCalendar.month) return "";
      const year = this.birthdayCalendar.year;
      const monthNum = this.birthdayCalendar.month;
      // 英文使用月份名称（Jan, Feb），中日文使用数字避免"月"字重复
      const isEnglish = this.locale === 'en-US';
      const monthName = isEnglish && this.strings.monthsShort
        ? this.strings.monthsShort[monthNum - 1]
        : String(monthNum);
      return this.strings.birthdaysTitleMonth
        .replace("{year}", year)
        .replace("{month}", monthName);
    },
    filteredBirthdayProfiles() {
      const query = (this.birthdaysSearchQuery || "").trim().toLowerCase();
      if (!query) return this.birthdayProfiles;
      const matches = this.birthdayProfiles.filter((user) => {
        const name = String(user.name || "").toLowerCase();
        const uid = String(user.uid || "").toLowerCase();
        return name.includes(query) || uid.includes(query);
      });
      if (matches.length === 1) return matches;
      return this.birthdayProfiles;
    },
    birthdayCalendarGrouped() {
      const map = new Map();
      this.filteredBirthdayProfiles.forEach((user) => {
        if (user.birthdayMonth === this.birthdayCalendar.month) {
          const list = map.get(user.birthdayDay) || [];
          list.push(user);
          map.set(user.birthdayDay, list);
        }
      });
      return map;
    },
    birthdayWeekdays() {
      return (
        this.strings.birthdaysWeekdays || ["日", "一", "二", "三", "四", "五", "六"]
      );
    },
    birthdayModalTitle() {
      if (!this.birthdayModal.month || !this.birthdayModal.day) return "";
      const month = this.birthdayModal.month;
      const day = this.birthdayModal.day;
      const n = this.birthdayModal.users.length;
      // 英文使用月份名称（Jan, Feb），中日文使用数字
      const isEnglish = this.locale === 'en-US';
      const monthName = isEnglish && this.strings.monthsShort
        ? this.strings.monthsShort[month - 1]
        : String(month);
      return this.strings.birthdaysModalTitle
        .replace("{month}", monthName)
        .replace("{day}", day)
        .replace("{n}", n);
    },
  },
  methods: {
    normalizeBirthday(raw) {
      if (typeof raw !== "string") return null;
      const trimmed = raw.trim();
      let match = trimmed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
      if (match) {
        const month = Number(match[2]);
        const day = Number(match[3]);
        if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
          return { month, day };
        }
        return null;
      }
      match = trimmed.match(/^(\d{1,2})-(\d{1,2})$/);
      if (match) {
        const month = Number(match[1]);
        const day = Number(match[2]);
        if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
          return { month, day };
        }
      }
      return null;
    },
    precomputeBirthdays() {
      const now = new Date();
      const todayStart = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
      );
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1;

      const parsed = [];
      for (const user of this.users || []) {
        const normalized = this.normalizeBirthday(user.birthday);
        if (!normalized) continue;
        const { month, day } = normalized;
        const nextDate = new Date(currentYear, month - 1, day);
        if (nextDate < todayStart) {
          nextDate.setFullYear(currentYear + 1);
        }
        const diffDays = Math.floor(
          (nextDate.getTime() - todayStart.getTime()) /
          (1000 * 60 * 60 * 24)
        );
        parsed.push({
          ...user,
          birthdayMonth: month,
          birthdayDay: day,
          birthdayNextDate: nextDate,
          birthdayDiffDays: diffDays,
        });
      }

      this.birthdayProfiles = parsed;

      this.birthdayCalendar.year = currentYear;
      this.birthdayCalendar.month = currentMonth;
      this.updateCalendar();
      this.todayBirthdays = parsed
        .filter((item) => item.birthdayDiffDays === 0)
        .sort((a, b) => (b.followers || 0) - (a.followers || 0));
    },
    updateCalendar() {
      const daysInMonth = new Date(
        this.birthdayCalendar.year,
        this.birthdayCalendar.month,
        0
      ).getDate();
      const firstDayWeek = new Date(
        this.birthdayCalendar.year,
        this.birthdayCalendar.month - 1,
        1
      ).getDay();
      this.birthdayCalendar.daysInMonth = daysInMonth;
      this.birthdayCalendar.firstDayWeek = firstDayWeek;
      this.buildBirthdayCells();
    },
    changeBirthdayMonth(offset) {
      let newMonth = this.birthdayCalendar.month + offset;
      let newYear = this.birthdayCalendar.year;

      if (newMonth > 12) {
        newMonth = 1;
        newYear++;
      } else if (newMonth < 1) {
        newMonth = 12;
        newYear--;
      }

      this.birthdayCalendar.month = newMonth;
      this.birthdayCalendar.year = newYear;
      this.updateCalendar();
    },
    buildBirthdayCells() {
      const placeholders = Array.from({
        length: this.birthdayCalendar.firstDayWeek || 0,
      }).map(() => ({ type: "empty" }));
      const monthUsers = this.birthdayCalendarGrouped;
      const today = new Date();
      const dayCells = Array.from({
        length: this.birthdayCalendar.daysInMonth || 0,
      }).map((_, idx) => {
        const dayNumber = idx + 1;
        const users = monthUsers.get(dayNumber) || [];
        return {
          type: "day",
          day: dayNumber,
          users,
          isToday:
            this.birthdayCalendar.year === today.getFullYear() &&
            this.birthdayCalendar.month === today.getMonth() + 1 &&
            dayNumber === today.getDate(),
        };
      });
      this.birthdayCalendar.cells = [...placeholders, ...dayCells];
    },
    openBirthdayModal(day, users) {
      if (!users || !users.length) return;
      this.birthdayModal = {
        open: true,
        month: this.birthdayCalendar.month,
        day,
        users: [...users].sort(
          (a, b) => (b.followers || 0) - (a.followers || 0)
        ),
      };
    },
    closeBirthdayModal() {
      this.birthdayModal = {
        open: false,
        month: null,
        day: null,
        users: [],
      };
    },
    triggerBirthdayJumpAnimation() {
      if (this.birthdayAutoJumpTimer) {
        window.clearTimeout(this.birthdayAutoJumpTimer);
        this.birthdayAutoJumpTimer = null;
      }
      this.birthdayAutoJumping = false;
      this.$nextTick(() => {
        this.birthdayAutoJumping = true;
        this.birthdayAutoJumpTimer = window.setTimeout(() => {
          this.birthdayAutoJumping = false;
          this.birthdayAutoJumpTimer = null;
        }, 900);
      });
    },
    maybeJumpToBirthdayMatch() {
      if (this.activeModule !== "birthdays") return;
      const query = (this.birthdaysSearchQuery || "").trim();
      if (!query) return;
      const matches = this.filteredBirthdayProfiles;
      if (matches.length !== 1) return;
      const match = matches[0];
      const targetMonth = Number(match.birthdayMonth);
      if (!targetMonth) return;
      const now = new Date();
      if (!this.birthdayCalendar.year) {
        this.birthdayCalendar.year = now.getFullYear();
      }
      if (this.birthdayCalendar.month !== targetMonth) {
        this.birthdayCalendar.month = targetMonth;
        this.updateCalendar();
      }
      this.triggerBirthdayJumpAnimation();
    },
  },
  watch: {
    filteredBirthdayProfiles() {
      this.buildBirthdayCells();
      this.maybeJumpToBirthdayMatch();
    },
    activeModule(newVal) {
      if (newVal === "birthdays") {
        this.$nextTick(() => this.maybeJumpToBirthdayMatch());
      }
    },
  },
  beforeUnmount() {
    if (this.birthdayAutoJumpTimer) {
      window.clearTimeout(this.birthdayAutoJumpTimer);
      this.birthdayAutoJumpTimer = null;
    }
  },
};
