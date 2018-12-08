/**
 * Create query portion of url for serialize method
 * @param {string} name
 * @param {object|Array|string} data
 * @returns {string} - part of url
 */
export function getQueryPart(name, data) {
    if (Array.isArray(data)) {
        return data.reduce((part, value) => part + getQueryPart(`${name}[]`, value), '');
    }

    if (typeof data === 'object') {
        return Object.keys(data).reduce((part, index) => part + getQueryPart(`${name}[${index}]`, data[index]), '');
    }

    return `${name}=${encodeURIComponent(data)}&`;
}

/**
 * Name regexp for conversion to path
 * @type {RegExp}
 */
const NAME = /(\[(\w*)\]|\w*)/gi;

/**
 * Convert input name to path array
 * @param {string} name - input name
 * @returns {Array} - path to value in data object
 */
export function convertNameToPath(name) {
    const path = [];

    let matches = NAME.exec(name);
    while (matches !== null) {
        if (matches.index === NAME.lastIndex) {
            NAME.lastIndex += 1;
        }

        path.push(matches[2] || matches[1]);

        matches = NAME.exec(name);
    }

    return path;
}

/**
 * Convert data object to a value for sending
 * @param {object} data - data object
 * @param {string} type - type of conversion
 * @param {function} FileListType
 * @param {function} FormDataType
 * @returns {string|FormData} - output value
 */
export function convertData(data, type, FileListType = FileList, FormDataType = FormData) {
    let convertedData;

    switch (type) {
        case 'serialize':
            convertedData = Object.keys(data).reduce((query, name) => `${query}${getQueryPart(name, data[name])}`, '');
            return convertedData.length ? convertedData.slice(0, -1) : '';
        case 'formData':
            return Object.keys(data).reduce((formData, name) => {
                if (data[name] instanceof FileListType) {
                    if (data[name].length > 1) {
                        for (let i = 0; i < data[name].length; i += 1) {
                            formData.append(`${name}[${i}]`, data[name][i]);
                        }
                    } else if (data[name].length === 1) {
                        formData.append(name, data[name][0]);
                    }
                } else if (typeof data[name] === 'object') {
                    Object.keys(data[name]).forEach(key => formData.append(`${name}[${key}]`, data[name][key]));
                } else {
                    formData.append(name, data[name]);
                }

                return formData;
            }, new FormDataType());
        case 'json':
        default:
            return JSON.stringify(data);
    }
}
