// @flow

import deepmerge from './lib/deepmerge';
import { getData, getInputData, getValueByName } from './lib/get-data';
import { convertData } from './lib/convert-data';
import Dictionary from './i18n/jedi-validate-i18n';
import { getFormOptions, getInputRules } from './lib/get-options';
import { validateData, validateField } from './lib/validate-data';
import { ajax } from './lib/ajax';
import { initErrorMessages, markField } from './lib/utils';
import defaultMethods from './lib/methods';
import defaultOptions from './options';
import type {
    AjaxOptions,
    MethodFunction,
    MethodMap,
    Options,
    RulesOptions,
    ValidationErrorMap,
    Response,
} from './types';
import GroupInput from './lib/group-input';

/**
 * JediValidate - validation
 */
export default class JediValidate {
    /**
     * Object with fields
     * @private
     * @type {Object.<string, Element>}
     */
    fields: { [string]: HTMLElement } = {};

    /**
     * Object with inputs nodes
     * @private
     * @type {Object.<string, HTMLInputElement|HTMLSelectElement|Array>}
     */
    inputs: { [string]: HTMLInputElement | HTMLSelectElement | Array<HTMLInputElement> } = {};

    /**
     * Object with message nodes
     * @private
     * @type {Object.<string, Element>}
     */
    messages: { [string]: HTMLElement } = {};

    /**
     * Object with error message
     * @private
     * @type {Object.<string, Object.<string, string>>}
     */
    errorMessages: ValidationErrorMap = {};

    /**
     * Object with error message
     * @private
     * @type {object} - data object
     */
    data = {};

    /**
     * Validate methods
     * @private
     * @type {Object.<string, {func: Function, message: string}>}
     */
    methods: MethodMap = { ...defaultMethods };
    /* eslint-disable */
    /**
     * Validator options
     * @private
     * @type {{ajax: {url: string, enctype: string, sendType: string, method: string}, rules: {}, messages: {}, containers: {parent: string, message: string, baseMessage: string}, states: {error: string, valid: string, pristine: string, dirty: string}, formStatePrefix: string, callbacks: {success: function, error: function}, clean: boolean, redirect: boolean, language: string, translations: {}}}
     */
    options: Options = {};

    /* eslint-enable */
    /**
     * Validator rules
     * @private
     * @type {object}
     */
    rules: RulesOptions = {};

    /**
     * Translation dictionary
     * @private
     * @type {Dictionary}
     */
    dictionary: Dictionary;

    /**
     * Elements
     * @private
     * @type {object}
     */
    nodes: {
        form: HTMLFormElement,
        inputs: Array<HTMLElement>,
        baseMessage: HTMLElement,
    };

    /**
     * Root element
     * @private
     * @type {Element}
     */
    root: HTMLElement;

    /**
     * JediValidate
     * @param {HTMLElement} root - element which wraps form element
     * @param {object} options - object with options
     */
    constructor(root: HTMLElement, options: Options = {}) {
        this.root = root;

        const baseMessageClass =
            (options.containers && options.containers.baseMessage) ||
            (defaultOptions.containers && defaultOptions.containers.baseMessage) ||
            'base-error';

        const form = this.root.querySelector('form');
        let baseMessage = this.root.querySelector(`.${baseMessageClass}`);

        if (!form || !(form instanceof HTMLFormElement)) {
            return console.error('Error: has no "form" element');
        }

        if (!baseMessage) {
            baseMessage = document.createElement('div');
            this.root.insertBefore(baseMessage, form);
        }

        const inputs = Array.from(this.root.querySelectorAll('form [name]'));

        this.nodes = {
            form,
            baseMessage,
            inputs,
        };

        const formOptions = getFormOptions(this.nodes.form);

        this.options = deepmerge(this.options, defaultOptions);
        this.options = deepmerge(this.options, formOptions);
        this.options = deepmerge(this.options, options);

        this.rules = { ...this.options.rules };

        this.dictionary = new Dictionary(this.options.translations);

        this.ready();

        this.errorMessages = initErrorMessages(this.rules, this.options.messages, this.methods);
    }

    /**
     * Ready
     * @private
     */
    ready() {
        this.nodes.form.setAttribute('novalidate', 'novalidate');

        this.nodes.form.addEventListener('submit', this.handleSubmit);

        Array.from(this.nodes.inputs).forEach(input => {
            if (!(input instanceof HTMLInputElement) || !Array.isArray(input)) {
                return;
            }

            // fixme "name" and "name in data" not the same
            // name === "phone[]",
            // data: { phone: [] } - name === "phone"
            const name = input.name; // eslint-disable-line prefer-destructuring

            if (this.inputs[name]) {
                if (this.inputs[name] instanceof GroupInput) {
                    this.inputs[name].add(input);
                } else {
                    this.inputs[name] = new GroupInput(name, [this.inputs[name], input]);
                }
            } else {
                this.inputs[name] = input;

                let field = input.parentNode;

                do {
                    if (this.options.containers && field.classList.contains(this.options.containers.parent)) {
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

                Object.keys(this.rules[name]).forEach(rule => {
                    if (this.rules[name][rule]) {
                        this.fields[name].classList.add(rule);
                    }
                });
            }
            input.addEventListener('change', this.handleInputChange.bind(this, name));
            input.addEventListener('input', this.handleInputInput.bind(this, name));
        });
    }

    /**
     * Handle input change
     * @private
     * @param {string} name
     */
    handleInputChange(name: string) {
        this.fields[name].classList.remove(this.options.states.dirty);

        const inputData = getInputData(this.inputs[name]);
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

        markField(this.fields[name], this.messages[name], this.options.states, errors);
    }

    /**
     * Handle input
     * @private
     * @param {string} name
     */
    handleInputInput(name: string) {
        this.fields[name].classList.remove(this.options.states.pristine);
        this.fields[name].classList.add(this.options.states.dirty);
    }

    /**
     * Handle form submit
     * @private
     * @param {Event} event
     */
    handleSubmit = (event: Event) => {
        this.data = getData(this.inputs);

        const errors = validateData(this.rules, this.methods, this.data, this.errorMessages, this.translate);

        const fieldNames = Object.keys(errors).filter(name => this.fields[name]);

        if (fieldNames.length !== 0) {
            fieldNames.forEach(name =>
                markField(this.fields[name], this.messages[name], this.options.states, errors[name]),
            );
        }

        const errorFieldNames = fieldNames.filter(name => errors[name]);

        if (errorFieldNames.length !== 0) {
            try {
                this.options.callbacks.error({ errors });
            } catch (e) {
                if (process.env.NODE_ENV === 'development') {
                    console.error(e);
                }
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
                if (process.env.NODE_ENV === 'development') {
                    console.error(e);
                }
            }

            return;
        }

        const convertedData = convertData(this.data, this.options.ajax.sendType);
        this.send({
            ...this.options.ajax,
            data: convertedData,
        });
    };

    /**
     * Translate
     * @private
     * @param {string} text - text to translate
     */
    translate = (text: string) => this.dictionary.translate(text, this.options.language);

    /**
     * Send form
     * @private
     * @param {object} options - object with options for sending
     * @param {string} options.url
     * @param {string} options.enctype
     * @param {string} options.sendType
     * @param {string} options.method
     * @param {string|FormData} options.data
     */
    send(options: AjaxOptions) {
        ajax(options, this.translate)
            .then((response: Response) => {
                if (response.validationErrors) {
                    try {
                        this.options.callbacks.error({
                            errors: response.validationErrors,
                        });
                    } catch (e) {
                        if (process.env.NODE_ENV === 'development') {
                            console.error(e);
                        }
                    }

                    if (response.validationErrors.base) {
                        this.nodes.baseMessage.innerHTML = response.validationErrors.base.join(', ');
                        this.root.classList.add(this.options.formStatePrefix + this.options.states.error);
                        this.root.classList.remove(this.options.formStatePrefix + this.options.states.valid);
                        delete response.validationErrors.base;
                    } else {
                        this.nodes.baseMessage.innerHTML = '';
                    }

                    Object.keys(response.validationErrors).forEach(name =>
                        markField(
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
                        if (process.env.NODE_ENV === 'development') {
                            console.error(e);
                        }
                    }

                    if (this.options.redirect && response.redirect) {
                        window.location.href = response.redirect;
                        return;
                    }

                    if (this.options.clean) {
                        this.nodes.form.reset();
                    }
                }
            })
            .catch(({ method, url, status, statusText }) => {
                console.warn(`${method} ${url} ${status} (${statusText})`);

                this.nodes.baseMessage.innerHTML = this.translate('Can not send form!');
                this.root.classList.add(this.options.formStatePrefix + this.options.states.error);
                this.root.classList.remove(this.options.formStatePrefix + this.options.states.valid);
            });
    }

    /**
     * Collect data
     * @public
     * @param {string|Array.<string>} params - field
     * @returns {Object}
     */
    collect(params: string | Array<string> = '') {
        if (!params) {
            this.data = getData(this.inputs);

            return this.data;
        }

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

    /**
     * Add rule to validator
     * @public
     * @param {string} rule - rule name
     * @param {Function} func - function
     * @param {string} message - error message
     */
    addMethod(rule: string, func: MethodFunction, message: string) {
        this.methods[rule] = {
            func,
            message,
        };

        this.errorMessages = initErrorMessages(this.rules, this.options.messages, this.methods);
    }

    /**
     * Add localization to JediValidate
     * @public
     * @param {string} sourceText - text on english
     * @param {string} translatedText - text on needed language
     * @param {string} language - language
     */
    addToDictionary(sourceText: string, translatedText: string, language: string) {
        this.dictionary.addTranslation(sourceText, translatedText, language);
    }
}
