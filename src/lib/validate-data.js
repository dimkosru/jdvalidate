import { getValueByName } from './get-data';

/**
 * Check rule for dependencies
 * @param {*} params - params of validation
 * @param {object} data - data of form
 * @returns {*} - params of validation or null if rule not checkable
 */
export function isCheckable(params, data) {
    if (!params) return null;

    let checkable = true;
    let param = params;

    if (Array.isArray(params)) {
        let dependencies = [];
        [param, ...dependencies] = params;
        if (!param) return null;

        try {
            checkable = dependencies
                .reduce((required, dependency) => (required && (typeof dependency === 'function' ? dependency(data) : !!data[dependency])), checkable);
        } catch (e) {
            console.warn(`Dependency function error: ${e.toString()}`);
        }
    }

    return checkable ? param : null;
}

/**
 * Validate field
 * @param {object} rules - object with rules for validation
 * @param {object} methods - validation methods
 * @param {string|FileList|Array} value - value of input
 * @param {string} name - name on input
 * @param {object} errorMessages - object with error messages
 * @param {object} data - data of form
 * @returns {Array.<string>} - array of field errors
 */
export function validateField(rules, methods, value, name, errorMessages, data) {
    const isEmpty = !methods.required.func(value);

    const isRequired = isCheckable(rules.required, data);

    if (isEmpty && isRequired) {
        return [errorMessages[name].required];
    }

    if (isEmpty) {
        return [];
    }

    return Object.keys(rules).reduce((errors, method) => {
        const params = isCheckable(rules[method], data);

        if (params === null) return errors;

        if (methods[method]) {
            const valid = methods[method].func(value, params);

            if (!valid) {
                errors.push(errorMessages[name][method]);
            }
        } else {
            errors.push(`Method "${method}" not found`);
        }

        return errors;
    }, []);
}

/**
 * Validate data object
 * @param {object} rules - object with rules for validation
 * @param {object} methods - validation methods
 * @param {object} data - data object
 * @param {object} errorMessages - object with error messages
 * @returns {object.<string, Array.<string>>} - object of fields error arrays
 */
export function validateData(rules, methods, data, errorMessages) {
    return Object.keys(rules).reduce((obj, name) => {
        const value = getValueByName(name, data);
        const errors = validateField(rules[name], methods, value, name, errorMessages, data);
        return {
            ...obj,
            [name]: errors.length ? errors : undefined,
        };
    }, {});
}
