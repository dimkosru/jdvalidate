const dictionary = require('./jedi-validate-i18n-data.json');

/**
 * Default language
 * @type {string}
 */
const defaultLanguage = 'en';

/**
 * Translate phrase
 * @param {string} text - phrase to translate
 * @param {string} language - language token
 * @returns {string} - translated text
 */
export function translate(text, language = defaultLanguage) {
    return (dictionary[language] && dictionary[language][text]) || text;
}

/**
 * Add translation pair to dictionary
 * @param {string} sourceText - phrase
 * @param {string} translatedText - translated phrase
 * @param {string} language - language token
 */
export function addTranslation(sourceText, translatedText, language = defaultLanguage) {
    if (dictionary[language] === undefined) {
        dictionary[language] = {};
    }

    dictionary[language][sourceText] = translatedText;
}
