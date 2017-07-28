/**
 * Mark field as invalid
 * @private
 * @param {Element} field
 * @param {Element} message
 * @param {object} classes
 * @param {string} classes.error
 * @param {string} classes.valid
 * @param {Array.<string>} errors
 */
export function markError(field, message, { error, valid }, errors) {
    if (!field || !message) {
        return;
    }

    field.classList.add(error);
    field.classList.remove(valid);

    message.innerHTML = errors.join(', '); // eslint-disable-line no-param-reassign
}

/**
 * Mark field as valid
 * @private
 * @param {Element} field
 * @param {Element} message
 * @param {object} classes
 * @param {string} classes.error
 * @param {string} classes.valid
 */
export function markValid(field, message, { error, valid }) {
    if (!field || !message) {
        return;
    }

    field.classList.add(valid);
    field.classList.remove(error);

    message.innerHTML = ''; // eslint-disable-line no-param-reassign
}

/**
 * Mark field
 * @private
 * @param {Element} field
 * @param message
 * @param states
 * @param errors
 */
export function markField(field, message, states, errors) {
    if (errors && errors.length) {
        markError(field, message, states, errors);
    } else {
        markValid(field, message, states);
    }
}

/**
 * Init error messages
 * @private
 * @param {object} rules
 * @param {object} messages
 * @param {object} methods
 * @returns {Object.<string, Object.<string, string>>}
 */
export function initErrorMessages(rules, messages, methods) {
    return Object.keys(rules).reduce((names, name) => ({
        ...names,
        [name]: Object.keys(rules[name]).reduce((ruleNames, method) => ({
            ...ruleNames,
            [method]: (messages[name] && messages[name][method]) || (methods[method] && methods[method].message) || '',
        }), {}),
    }), {});
}
