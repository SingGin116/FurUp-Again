import { baseMixin } from "./modules/base.js?v=ff631d9";
import { birthdaysMixin } from "./modules/birthdays.js?v=ff631d2";
import { cardsMixin } from "./modules/cards.js?v=ff631d2";
import { chartMixin } from "./modules/chart.js?v=ff631d2";
import { meetupsMixin } from "./modules/meetups.js?v=ff631d2";
import { costumesMixin } from "./modules/costumes.js?v=ff631d2";
import { artistsMixin } from "./modules/artists.js?v=ff631d2";
import { thanksMixin } from "./modules/thanks.js?v=ff631d2";
import { guideMixin } from "./modules/guide.js?v=ff631d2";
import { recommendMixin } from "./modules/recommend.js?v=ff631d2";
import { avatarMixin } from "./modules/avatarMixin.js?v=ff631d9";
import { applyTheme, getInitialTheme } from "./utils/helpers.js?v=ff631d2";
import { appTemplate } from "./templates/appTemplate.js?v=ff631d9";

applyTheme(getInitialTheme());

const { createApp } = window.Vue;

createApp({
  template: appTemplate,
  mixins: [
    baseMixin,
    avatarMixin,
    cardsMixin,
    chartMixin,
    birthdaysMixin,
    meetupsMixin,
    costumesMixin,
    artistsMixin,
    thanksMixin,
    guideMixin,
    recommendMixin,
  ],
}).mount("#app");
