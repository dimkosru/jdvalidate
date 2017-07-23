/**
 * Get ajax options from form
 * @param {HTMLFormElement} form - form element
 * @returns {{ajax: {url: string, method: string, enctype: string, sendType: *}}} - options
 */
export function getFormOptions(form) {
    const enctype = form.getAttribute('enctype');

    return {
        ajax: {
            enctype,
            url: form.getAttribute('action'),
            method: form.getAttribute('method'),
            sendType: enctype === 'multipart/form-data' ? 'formData' : undefined,
        },
    };
}

/**
 * Get validate options from input attribute of className
 * @param {HTMLInputElement|HTMLSelectElement} input - input for validation
 * @returns {object} - rules
 */
export function getInputRules(input) {
    const defaultRules = ['required', 'email', 'tel', 'url'];

    const rules = defaultRules.reduce((inputRules, rule) => {
        const newRules = {};
        const newRule = input.hasAttribute(rule) || input.type === rule || input.classList.contains(rule); // eslint-disable-line max-len

        if (newRule) {
            newRules[rule] = newRule;
        }

        return {
            ...inputRules,
            ...newRules,
        };
    }, {});

    const regexp = input.hasAttribute('pattern') ? new RegExp(input.getAttribute('pattern')) : undefined;

    if (regexp) {
        rules.regexp = regexp;
    }

    return rules;
}
