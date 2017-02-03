import deepmerge from 'deepmerge';
import { getData, getInputData, getValueByName } from './lib/get-data.es6';
import { convertData } from './lib/convert-data.es6';
import { addTranslation, translate } from './i18n/jedi-validate-i18n.es6';
import { getFormOptions, getInputRules } from './lib/get-options.es6';
import { validateData, validateField } from './lib/validate-data.es6';
import { ajax } from './lib/ajax.es6';
import defaultMethods from './lib/methods.es6';

class JediValidate {
    /**
     * Object with fields
     * @type {Object.<string, Element>}
     */
    fields = {};
    /**
     * Object with inputs nodes
     * @type {Object.<string, HTMLInputElement|HTMLSelectElement|Array>}
     */
    inputs = {};
    /**
     * Object with message nodes
     * @type {Object.<string, Element>}
     */
    messages = {};
    /**
     * Object with error message
     * @type {Object.<string, Object.<string, string>>}
     */
    errorMessages = {};
    /**
     * Object with error message
     * @type {object} - data object
     */
    data = {};
    /**
     * Validate methods
     * @type {Object.<string, {func: Function, message: string}>}
     */
    methods = { ...defaultMethods };
    /**
     * Validator options
     * @type {{ajax: {url: string, enctype: string, sendType: string, method: string}, rules: {}, messages: {}, containers: {parent: string, message: string, baseMessage: string}, states: {error: string, valid: string, pristine: string, dirty: string}, formStatePrefix: string, callbacks: {success: (function(object)), error: (function(object.<string, Array.<string>>))}, clean: boolean, redirect: boolean, language: string, translations: {}}}
     */
    options = {};
    /**
     * Validator rules
     * @type {object}
     */
    rules = {};

    /**
     * JediValidate
     * @param {HTMLElement} root - element which wrap form element
     * @param {object} options - object with options
     */
    constructor(root, options = {}) {
        const defaultOptions = {
            ajax: {
                url: null,
                enctype: 'application/x-www-form-urlencoded',
                sendType: 'serialize', // 'serialize', 'formData', 'json'
                method: 'GET',
            },
            rules: {},
            messages: {},
            containers: {
                parent: 'form-group',
                message: 'help-block',
                baseMessage: 'base-error',
            },
            states: {
                error: 'error',
                valid: 'valid',
                pristine: 'pristine',
                dirty: 'dirty',
            },
            formStatePrefix: 'jedi-',
            callbacks: {
                success() {
                },
                error() {
                },
            },
            clean: true,
            redirect: true,
            language: 'en',
            translations: {},
        };

        this.root = root;

        this.options = deepmerge(defaultOptions, options);

        this.nodes = JediValidate.cacheNodes(this.root, this.options);

        const formOptions = getFormOptions(this.nodes.form);

        this.options = deepmerge(this.options, defaultOptions);
        this.options = deepmerge(this.options, formOptions);
        this.options = deepmerge(this.options, options);

        this.rules = { ...this.options.rules };

        // todo rewrite translations
        Object.keys(this.options.translations).forEach((language) => {
            Object.keys(this.options.translations[language]).forEach((translation) => {
                addTranslation(
                    translation,
                    this.options.translations[language][translation],
                    language,
                );
            });
        });

        this.ready();

        this.errorMessages = JediValidate.initErrorMessages(
            this.rules,
            this.options.messages,
            this.methods,
            this.options.language,
        );
    }

    /**
     * Add localisation to JediValidate
     * @param {string} sourceText - text on english
     * @param {string} translatedText - text on needed language
     * @param {string} language - language
     */
    static addToDictionary(sourceText, translatedText, language) {
        addTranslation(sourceText, translatedText, language);
    }

    /**
     * Return object with working elements
     * @param root Root element for search
     * @param options Object with selectors
     * @returns {{form: Element, inputs: NodeList, baseMessage: Element}}
     */
    static cacheNodes(root, options) {
        return {
            form: root.querySelector('form'),
            inputs: root.querySelectorAll('[name]'),
            baseMessage: root.querySelector(`.${options.containers.baseMessage}`),
        };
    }

    ready() {
        this.nodes.form.setAttribute('novalidate', 'novalidate');

        this.nodes.form.addEventListener('submit', (event) => {
            event.preventDefault();
            this.data = getData(this.inputs);

            const errors = validateData(
                this.rules,
                this.methods,
                this.data,
                this.errorMessages,
            );

            if (errors && Object.keys(errors).filter(name => errors[name]).length !== 0) {
                Object.keys(errors).forEach(name =>
                    JediValidate.markField(
                        this.fields[name],
                        this.messages[name],
                        this.options.states,
                        errors[name],
                    ),
                );

                try {
                    this.options.callbacks.error(errors);
                } catch (e) {
                    console.error(e);
                }

                event.preventDefault();
                return;
            }

            if (this.options.ajax && this.options.ajax.url) {
                event.preventDefault();
            } else {
                try {
                    this.options.callbacks.success(null);
                } catch (e) {
                    console.error(e);
                }

                return;
            }

            const convertedData = convertData(this.data, this.options.ajax.sendType);
            this.send({
                ...this.options.ajax,
                data: convertedData,
            });
        });

        this.nodes.inputs.forEach((input) => {
            // fixme "name" and "name in data" not the same
            // name === "phone[]",
            // data: { phone: [] } - name === "phone"
            const name = input.name;

            if (this.inputs[name]) {
                if (Array.isArray(this.inputs[name])) {
                    this.inputs[name].push(input);
                } else {
                    const groupInput = [this.inputs[name], input];
                    groupInput.name = name;
                    this.inputs[name] = groupInput;
                }
            } else {
                this.inputs[name] = input;

                let field = input.parentNode;

                do {
                    if (field.classList.contains(this.options.containers.parent)) {
                        this.fields[name] = field;
                        break;
                    }

                    field = field.parentNode;
                } while (field);

                if (!this.fields[name]) {
                    throw new Error('Have no parent field');
                }

                this.fields[name].classList.add(this.options.states.pristine);

                const messageElement = this.fields[name].querySelector(`.${this.options.containers.message}`);

                if (messageElement) {
                    this.messages[name] = messageElement;
                } else {
                    this.messages[name] = document.createElement('div');
                    this.messages[name].classList.add(this.options.containers.message);
                    this.fields[name].appendChild(this.messages[name]);
                }

                this.rules[name] = this.rules[name] || {};
                const inputRules = getInputRules(input);
                this.rules[name] = deepmerge(inputRules, this.rules[name]);

                Object.keys(this.rules[name]).forEach((rule) => {
                    if (this.rules[name][rule]) {
                        this.fields[name].classList.add(rule);
                    }
                });
            }

            input.addEventListener('change', () => {
                this.fields[name].classList.remove(this.options.states.dirty);

                const inputData = getInputData(input);
                const value = getValueByName(name, inputData);

                // fixme don't work with 2 inputs phone[]
                this.data = {
                    ...this.data,
                    ...inputData,
                };

                const errors = validateField(
                    this.rules[name],
                    this.methods,
                    value,
                    name,
                    this.errorMessages,
                    this.data,
                );

                JediValidate.markField(
                    this.fields[name],
                    this.messages[name],
                    this.options.states,
                    errors,
                );
            });

            input.addEventListener('input', () => {
                this.fields[name].classList.remove(this.options.states.pristine);
                this.fields[name].classList.add(this.options.states.dirty);
            });
        });
    }

    /**
     * Send form
     * @param {object} options - object with options for sending
     * @param {string} options.url
     * @param {string} options.enctype
     * @param {string} options.sendType
     * @param {string} options.method
     * @param {string|FormData} options.data
     */
    send(options) {
        ajax(options).then((response) => {
            if (response.validationErrors) {
                try {
                    this.options.callbacks.error(response.validationErrors);
                } catch (e) {
                    console.error(e);
                }

                if (response.validationErrors.base) {
                    this.nodes.baseMessage.innerHTML = response.validationErrors.base.join(', ');
                    this.root.classList.add(this.options.formStatePrefix + this.options.states.error); // eslint-disable-line max-len
                    this.root.classList.remove(this.options.formStatePrefix + this.options.states.valid); // eslint-disable-line max-len
                    delete response.validationErrors.base; // eslint-disable-line no-param-reassign
                } else {
                    this.nodes.baseMessage.innerHTML = '';
                }

                Object.keys(response.validationErrors).forEach(name =>
                    JediValidate.markField(
                        this.fields[name],
                        this.messages[name],
                        this.options.states,
                        response.validationErrors[name],
                    ),
                );
            } else {
                try {
                    this.options.callbacks.success(response);
                } catch (e) {
                    console.error(e);
                }

                if (this.options.redirect && response.redirect) {
                    window.location.href = response.redirect;
                    return;
                }

                if (this.options.clean) {
                    this.nodes.form.reset();
                }
            }
        }).catch(({ method, url, status, statusText }) => {
            console.warn(`${method} ${url} ${status} (${statusText})`);

            this.nodes.baseMessage.innerHTML = translate('Can not send form!', this.options.language);
            this.root.classList.add(this.options.formStatePrefix + this.options.states.error); // eslint-disable-line max-len
            this.root.classList.remove(this.options.formStatePrefix + this.options.states.valid); // eslint-disable-line max-len
        });
    }

    /**
     *
     * @param {Element} field
     * @param message
     * @param states
     * @param errors
     */
    static markField(field, message, states, errors) {
        if (errors && errors.length) {
            JediValidate.markError(field, message, states, errors);
        } else {
            JediValidate.markValid(field, message, states);
        }
    }

    /**
     *
     * @param {Element} field
     * @param {Element} message
     * @param {string} error
     * @param {string} valid
     * @param {Array.<string>} errors
     */
    static markError(field, message, { error, valid }, errors) {
        if (!field || !message) {
            return;
        }

        field.classList.add(error);
        field.classList.remove(valid);

        message.innerHTML = errors.join(', '); // eslint-disable-line no-param-reassign
    }

    /**
     *
     * @param {Element} field
     * @param {Element} message
     * @param {string} error
     * @param {string} valid
     */
    static markValid(field, message, { error, valid }) {
        if (!field || !message) {
            return;
        }

        field.classList.add(valid);
        field.classList.remove(error);

        message.innerHTML = ''; // eslint-disable-line no-param-reassign
    }

    /**
     * Add rule to validator
     * @param {string} rule - rule name
     * @param {Function} func - function
     * @param {string} message - error message
     */
    addMethod(rule, func, message) {
        this.methods[rule] = {
            func,
            message,
        };
    }

    /**
     * Init error messages
     * @param {object} rules
     * @param {object} messages
     * @param {object} methods
     * @param {string} language
     * @returns {Object.<string, Object.<string, string>>}
     */
    static initErrorMessages(rules, messages, methods, language) {
        return Object.keys(rules).reduce((names, name) => ({
            ...names,
            [name]: Object.keys(rules[name]).reduce((ruleNames, method) => ({
                ...ruleNames,
                [method]: translate((messages[name] && messages[name][method]) || (methods[method] && methods[method].message) || '', language),
            }), {}),
        }), {});
    }
}

module.exports = JediValidate;
