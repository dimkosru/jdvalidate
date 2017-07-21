import deepmerge from 'deepmerge';
import { getData, getInputData, getValueByName } from './lib/get-data';
import { convertData } from './lib/convert-data';
import Dictionary from './i18n/jedi-validate-i18n';
import Dictionary from './i18n/jedi-validate-i18n';
import { getFormOptions, getInputRules } from './lib/get-options';
import { validateData, validateField } from './lib/validate-data';
import { ajax } from './lib/ajax';
import defaultMethods from './lib/methods';

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
    /* eslint-disable */
    /**
     * Validator options
     * @type {{ajax: {url: string, enctype: string, sendType: string, method: string}, rules: {}, messages: {}, containers: {parent: string, message: string, baseMessage: string}, states: {error: string, valid: string, pristine: string, dirty: string}, formStatePrefix: string, callbacks: {success: (function(object)), error: (function(object.<string, Array.<string>>))}, clean: boolean, redirect: boolean, language: string, translations: {}}}
     */
    options = {};
    /* eslint-enable */
    /**
     * Validator rules
     * @type {object}
     */
    rules = {};

    /**
     * Translation dictionary
     * @type {Dictionary}
     */
    dictionary = null;

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
                success({ event, response }) { // eslint-disable-line no-unused-vars
                },
                error({ errors }) { // eslint-disable-line no-unused-vars
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

        this.dictionary = new Dictionary(this.options.translations);

        this.ready();

        this.errorMessages = JediValidate.initErrorMessages(
            this.rules,
            this.options.messages,
            this.methods,
            this.options.language,
        );
    }

    /**
     * Return object with working elements
     * @param root Root element for search
     * @param options Object with selectors
     * @returns {{form: HTMLFormElement, inputs: NodeList, baseMessage: Element}}
     */
    static cacheNodes(root, options) {
        return {
            form: root.querySelector('form'),
            inputs: root.querySelectorAll('form [name]'),
            baseMessage: root.querySelector(`.${options.containers.baseMessage}`),
        };
    }

    ready() {
        this.nodes.form.setAttribute('novalidate', 'novalidate');

        this.nodes.form.addEventListener('submit', (event) => {
            this.data = getData(this.inputs);

            const errors = validateData(
                this.rules,
                this.methods,
                this.data,
                this.errorMessages,
                this.translate,
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
                    this.options.callbacks.error({ errors });
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
                    this.options.callbacks.success({ event });
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
                } while (field && field.classList);

                if (!this.fields[name]) {
                    console.warn(`Input ${name} has no parent field`);
                    delete this.inputs[name];
                    return;
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
                    this.translate,
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
     * Translate
     * @param {string} text - text to translate
     */
    translate = text => this.dictionary.translate(text, this.options.language);

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
                    this.options.callbacks.error({ errors: response.validationErrors });
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
                    this.options.callbacks.success({ response });
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

            this.nodes.baseMessage.innerHTML = this.translate('Can not send form!');
            this.root.classList.add(this.options.formStatePrefix + this.options.states.error); // eslint-disable-line max-len
            this.root.classList.remove(this.options.formStatePrefix + this.options.states.valid); // eslint-disable-line max-len
        });
    }

    /**
     * Collect data
     * @param {string|Array.<string>} params - field
     * @returns {Object}
     */
    collect(params = '') {
        if (params) {
            if (Array.isArray(params)) {
                return params.reduce((collected, name) => {
                    const inputData = getInputData(this.inputs[name]);

                    this.data = {
                        ...this.data,
                        ...inputData,
                    };

                    return {
                        ...collected,
                        ...inputData,
                    };
                }, {});
            }

            const inputData = getInputData(this.inputs[params]);

            // fixme don't work with 2 inputs phone[]
            this.data = {
                ...this.data,
                ...inputData,
            };

            return inputData;
        }

        this.data = getData(this.inputs);

        return this.data;
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
     * Mark field as invalid
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
     * Mark field as valid
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
    addToDictionary(sourceText, translatedText, language) {
        this.dictionary.addTranslation(sourceText, translatedText, language);
    }

    /**
     * Init error messages
     * @param {object} rules
     * @param {object} messages
     * @param {object} methods
     * @returns {Object.<string, Object.<string, string>>}
     */
    static initErrorMessages(rules, messages, methods) {
        return Object.keys(rules).reduce((names, name) => ({
            ...names,
            [name]: Object.keys(rules[name]).reduce((ruleNames, method) => ({
                ...ruleNames,
                [method]: (messages[name] && messages[name][method]) || (methods[method] && methods[method].message) || '',
            }), {}),
        }), {});
    }
}

module.exports = JediValidate;
