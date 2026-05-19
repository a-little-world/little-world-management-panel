import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Cookies from 'js-cookie';
import { initReactI18next } from 'react-i18next';

import { LANGUAGES } from './constants';
import translationDE from './locale/de.json';
import translationEN from './locale/en.json';

i18next
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    /*
    I'm overwriting the seperators here since the backend also uses '.' in the translations!
    */
    nsSeparator: ':::',
    keySeparator: '::',
    resources: {
      en: {
        translation: translationEN,
      },
      de: {
        translation: translationDE,
      },
    },
    languages: [LANGUAGES.en, LANGUAGES.de],
    fallbackLng: LANGUAGES.de,
  });

export default i18next;

export const COOKIE_LANG = 'frontendLang';
const cookie = Cookies.get(COOKIE_LANG);
if (cookie !== undefined) {
  i18next.changeLanguage(cookie);
}

// eslint-disable-next-line import/prefer-default-export
export const updateTranslationResources = ({ apiTranslations }) => {
  Object.keys(apiTranslations).forEach(lang => {
    i18next.addResourceBundle(lang, 'translation', {
      ...i18next.getResourceBundle(lang, 'translation'),
      ...apiTranslations[lang],
    });
  });
};
