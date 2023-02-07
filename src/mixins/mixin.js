import Vue from "vue";
import { firebaseConfig, ownPlateConfig } from "@/config/project";
import { regionalSettings } from "@/config/constant";
import moment from "moment";

import { defaultHeader } from "@/config/header";
import { formatOption } from "@/utils/strings";

import { roundPrice, taxRate } from "@/utils/utils";

const mixin = {
  methods: {
    restaurantId() {
      return this.$route.params.restaurantId;
    },
    resizedProfileImage(restaurant, size) {
      return (
        (restaurant?.images?.profile?.resizedImages || {})[size] ||
        restaurant?.restProfilePhoto
      );
    },
    num2time(num) {
      if (num === 0 || num === 60 * 24) {
        return this.$t("shopInfo.midnight");
      }
      if (num === 60 * 12) {
        return this.$t("shopInfo.noon");
      }
      const offsetTime = this.$i18n.locale == "ja" ? 12 : 13;
      const isPm = num >= 60 * 12;
      if (num >= 60 * offsetTime) {
        num = num - 60 * 12;
      }
      const formatedTime = [
        String(Math.floor(num / 60)).padStart(2, "0"),
        ":",
        String(num % 60).padStart(2, "0"),
        " ",
      ].join("");

      if (isPm) {
        return this.$tc("shopInfo.pm", 1, { formatedTime });
      }
      return this.$tc("shopInfo.am", 0, { formatedTime });
    },
    moment(value) {
      return moment(value);
    },
    soundPlay(reason) {
      this.$store.commit("pingOrderEvent");
      if (reason) {
        console.log("order: call play: " + reason);
      } else {
        console.log("order: call play");
      }
    },
    displayOption(option, shopInfo, item) {
      return formatOption(option, (price) => {
        return this.$n(roundPrice(price * taxRate(shopInfo, item)), "currency");
      });
    },
  },
  computed: {
    defaultTitle() {
      return defaultHeader.title;
    },
    regionalSetting() {
      return regionalSettings[ownPlateConfig.region || "US"];
    },
    user() {
      return this.$store.state.user;
    },
    isAdmin() {
      return !!this.$store.getters.uidAdmin;
    },
    isCustomer() {
      return !!this.$store.getters.uidUser;
    },
    isLiffUser() {
      return !!this.$store.getters.uidLiff;
    },
    userLiffId() {
      return this.$store.getters.liffId;
    },
    isAnonymous() {
      // TODO
      return this.$store.getters.isAnonymous;
    },
    isLineUser() {
      // TODO
      const claims = this.$store.state.claims;
      return !!claims?.line;
    },
    isLocaleJapan() {
      // for hack
      console.log(this.$i18n.locale);
      // return this.$i18n.locale === "ja";
      // TODO: why not ja ?
      return this.$i18n.locale !== "en" && this.$i18n.locale !== "fr";
    },
    inLiff() {
      // BY path
      return !!this.$route.params.liffIndexId;
    },
    liffIndexId() {
      return this.$route.params.liffIndexId;
    },
    featureHeroMobile() {
      return this.regionalSetting.FeatureHeroMobile[
        this.isLocaleJapan ? "ja" : "en"
      ];
    },
    featureHeroTablet() {
      return this.regionalSetting.FeatureHeroTablet[
        this.isLocaleJapan ? "ja" : "en"
      ];
    },
    isUser() {
      return !!this.$store.getters.uidUser;
    },
    isNotSuperAdmin() {
      return this.$store.getters.isNotSuperAdmin;
    },
    isNotOperator() {
      return this.$store.getters.isNotOperator;
    },
  },
};

export default mixin;
