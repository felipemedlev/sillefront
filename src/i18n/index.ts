import 'intl-pluralrules';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import { Platform } from 'react-native';

import en from './locales/en.json';
import es from './locales/es.json';

const RESOURCES = {
    en: { translation: en },
    es: { translation: es },
};

const LANGUAGE_DETECTOR = {
    type: 'languageDetector',
    async: true,
    detect: async (callback: (lang: string) => void) => {
        try {
            // 1. Check AsyncStorage for saved language
            const savedLanguage = await AsyncStorage.getItem('user-language');
            if (savedLanguage) {
                return callback(savedLanguage);
            }

            // 2. Check Device Locale
            const deviceLanguage = Localization.getLocales()[0].languageCode;

            // Support 'es' and 'en', default to 'es' if neither
            if (deviceLanguage === 'en') {
                return callback('en');
            }
            return callback('es');

        } catch (error) {
            console.log('Error reading language', error);
            callback('es'); // Fallback
        }
    },
    init: () => { },
    cacheUserLanguage: async (language: string) => {
        try {
            await AsyncStorage.setItem('user-language', language);
        } catch (error) {
            console.log('Error saving language', error);
        }
    },
};

i18n
    .use(initReactI18next)
    .use(LANGUAGE_DETECTOR as any) // Cast to any to satisfy TS for custom detector
    .init({
        resources: RESOURCES,
        fallbackLng: 'es',
        interpolation: {
            escapeValue: false, // react already safes from xss
        },
        react: {
            useSuspense: false, // useful for React Native to avoid fallback screen
        },
        // @ts-ignore
        // compatibilityJSON: 'v3', // For Android/Hermes
    });

export default i18n;
