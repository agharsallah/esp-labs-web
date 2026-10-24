// Types the interface catalogues from their English source, so t("key") is checked: a typo or
// a removed key fails the build. Other languages must have the same keys (catalogues.test.ts).
import "i18next";
import type common from "@/locales/en/common.json";
import type home from "@/locales/en/home.json";
import type lesson from "@/locales/en/lesson.json";
import type code from "@/locales/en/code.json";
import type settings from "@/locales/en/settings.json";
import type bench from "@/locales/en/bench.json";
import type parts from "@/locales/en/parts.json";
import type labsShared from "@/locales/en/labs-shared.json";
import type labsIntro from "@/locales/en/labs-intro.json";
import type labsDisplay from "@/locales/en/labs-display.json";
import type labsWifi from "@/locales/en/labs-wifi.json";
import type labsRfid from "@/locales/en/labs-rfid.json";
import type labsBle from "@/locales/en/labs-ble.json";
import type labsSound from "@/locales/en/labs-sound.json";
import type chip from "@/locales/en/chip.json";

declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: "common";
    returnNull: false;
    resources: {
      common: typeof common;
      home: typeof home;
      lesson: typeof lesson;
      code: typeof code;
      settings: typeof settings;
      bench: typeof bench;
      parts: typeof parts;
      "labs-shared": typeof labsShared;
      "labs-intro": typeof labsIntro;
      "labs-display": typeof labsDisplay;
      "labs-wifi": typeof labsWifi;
      "labs-rfid": typeof labsRfid;
      "labs-ble": typeof labsBle;
      "labs-sound": typeof labsSound;
      chip: typeof chip;
    };
  }
}
