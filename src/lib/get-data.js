import deepmerge from 'deepmerge';

import { convertNameToPath } from './convert-data';

/**
 * Create object by path and value
 * @param {Array} path - path array
 * @param {string|FileList} value - value on input
 * @returns {object} - data object
 */
export function createObject(path, value) {
    const segment = path[0];

    if (!segment || segment.length === 0) {
        return value;
    } else if (segment === '[]') {
        return [createObject(path.slice(1), value)];
    }

    return { [segment]: createObject(path.slice(1), value) };
}

/**
 * Get value from data object by path
 * @param {Array} path - value path
 * @param {object} data - data object
 * @returns {string} - value
 */
export function getValueByPath(path, data) {
    return path.reduce((value, segment) => (segment && value ? value[segment] : value), data || '');
}

/**
 * Get value from data object by name
 * @param {string} name - input name
 * @param {object} data - data object
 */
export function getValueByName(name, data) {
    const path = convertNameToPath(name);
    return getValueByPath(path, data);
}

/**
 * Get value from radio group
 * @param {Array} inputs - array of radio inputs
 * @returns {string|Array.<string>} - value of checked input
 */
export function getRadioGroupValue(inputs) {
    const values = [...inputs].map(radio => getInputValue(radio)).filter(Boolean); // eslint-disable-line no-use-before-define, max-len

    return values.length > 1 ? values : values[0];
}

/**
 * Get value form input
 * @param {Element|HTMLInputElement|HTMLSelectElement|Array} input - input
 * @returns {string|FileList|Array} - value of input, or array of value if input is select
 */
export function getInputValue(input) {
    if (!input) return '';

    const { type } = input;

    if (Array.isArray(input)) {
        return getRadioGroupValue(input);
    }

    switch (type) {
        case 'select-one':
            return input.options && input.options[input.selectedIndex] ? input.options[input.selectedIndex].value : '';
        case 'select-multiple':
            return [...input.options].filter(option => option.selected).map(option => option.value);
        case 'checkbox':
        case 'radio':
            return input.checked ? input.value : '';
        case 'file':
            return input.files;
        default:
            return input.value;
    }
}

/**
 * Get name from input or array of inputs
 * @param {HTMLInputElement|Array} input - input element or Array of HTMLInputElements
 * @returns {string} - input name
 */
export function getInputName(input) {
    return Array.isArray(input) ? input[0].name : input.name;
}

/**
 * Get object which key is name of input and value is value of input
 * @param {HTMLInputElement|Array} input - input element or Array of HTMLInputElements
 * @returns {object} - data
 */
export function getInputData(input) {
    const value = getInputValue(input);
    const name = getInputName(input);
    const path = convertNameToPath(name);

    return createObject(path, value);
}

/**
 * Get data object with values from inputs object
 * @param {object} inputs - inputs object
 * @returns {object} - data object
 */
export function getData(inputs) {
    return Object.keys(inputs).reduce(
        (data, name) => deepmerge(data, getInputData(inputs[name])),
        {},
    );
}
