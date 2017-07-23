/**
 * Check value is not empty
 * @param {string|FileList|Array} value
 * @returns {boolean} - true=valid, false=invalid
 */
export function required(value) {
    if (!value) return false;
    if (value.length !== undefined && value.length === 0) return false;
    if (typeof value === 'string' && value.trim() === '') return false;

    return true;
}

/**
 * Test RegExp
 * @param {string} value
 * @param {RegExp} exp - regular expression
 * @returns {boolean} - true == valid, false == invalid
 */
export function regexp(value, exp) {
    return exp.test(value);
}

/**
 * Check value is email
 * @param {string} value - email
 * @returns {boolean} - true == valid, false == invalid
 */
export function email(value) {
    return /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(value);
}

/**
 * Check files size less then max
 * @param {FileList} value - FileList
 * @param {number} size - max file size
 * @returns {boolean} - true == valid, false == invalid
 */
export function filesize(value, size) {
    return [...value].reduce((r, file) => file.size < size && r, true);
}

/**
 * Check files extensions
 * @param {FileList} value - FileList
 * @param {string} extensions - extensions list
 * @returns {boolean} - true == valid, false == invalid
 */
export function extension(value, extensions) {
    return [...value].reduce((r, file) => extensions.indexOf(file.name.split('.').pop()) !== -1 && r, true);
}

/**
 * Check value is phone
 * @param {string} value - phone
 * @returns {boolean} - true == valid, false == invalid
 */
export function tel(value) {
    return /^([+]+)*[0-9\x20\x28\x29-]{5,20}$/.test(value);
}

/**
 * Check value is url
 * @param {string} value - url
 * @returns {boolean} - true == valid, false == invalid
 */
export function url(value) {
    return /[-a-zA-Z0-9@:%_+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_+.~#?&//=]*)?/gi.test(value);
}


export default {
    required: {
        func: required,
        message: 'This field is required',
    },
    regexp: {
        func: regexp,
        message: 'Please, provide correct value',
    },
    email: {
        func: email,
        message: 'This email is incorrect',
    },
    filesize: {
        func: filesize,
        message: 'This file is too large',
    },
    extension: {
        func: extension,
        message: 'This extension is not supported',
    },
    tel: {
        func: tel,
        message: 'This phone number is incorrect',
    },
    url: {
        func: url,
        message: 'Wrong url',
    },
};
