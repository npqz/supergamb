import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import de from "./locales/de.json";
import es from "./locales/es.json";
import fr from "./locales/fr.json";
import hi from "./locales/hi.json";
import it from "./locales/it.json";
import pt from "./locales/pt.json";

const STORAGE_KEY = "supergamb_lang";

const savedLang = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
const initialLang = savedLang && ["en", "es", "de", "fr", "it", "pt", "hi"].includes(savedLang)
  ? savedLang
  : "en";

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    es: { translation: es },
    de: { translation: de },
    fr: { translation: fr },
    it: { translation: it },
    pt: { translation: pt },
    hi: { translation: hi },
  },
  lng: initialLang,
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

i18n.on("languageChanged", (lng) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, lng);
  }
});

export default i18n;
