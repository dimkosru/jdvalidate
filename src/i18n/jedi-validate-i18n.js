const defaultDictionary = require('./jedi-validate-i18n-data.json');

/**
 * Dictionary for translation
 */
export default class Dictionary {
    /**
     * Dictionary store
     * @type {Object}
     */
    dictionary = {};

    /**
     * Default language
     * @type {string}
     */
    defaultLanguage = 'en';

    /**
     * Dictionary
     * @param {Object} translations
     */
    constructor(translations) {
        this.addTranslations(defaultDictionary);
        this.addTranslations(translations);
    }

    /**
     * Translate phrase
     * @param {string} text - phrase to translate
     * @param {string} language - language token
     * @returns {string} - translated text
     */
    translate(text, language = this.defaultLanguage) {
        return (this.dictionary[language] && this.dictionary[language][text]) || text;
    }

    /**
     * Add translation pair to dictionary
     * @param {string} sourceText - phrase
     * @param {string} translatedText - translated phrase
     * @param {string} language - language token
     */
    addTranslation(sourceText, translatedText, language = this.defaultLanguage) {
        if (this.dictionary[language] === undefined) {
            this.dictionary[language] = {};
        }

        this.dictionary[language][sourceText] = translatedText;
    }

    /**
     * Add translations to dictionary
     * @param {Object} translations
     */
    addTranslations(translations) {
        Object.keys(translations).forEach(language => {
            Object.keys(translations[language]).forEach(translation => {
                this.addTranslation(translation, translations[language][translation], language);
            });
        });
    }
}
