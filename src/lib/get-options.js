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
 * Get validatation options from input attribute of className
 * @param {HTMLInputElement|HTMLSelectElement} input - input for validation
 * @returns {object} - rules
 */
export function getInputRules(input) {
    const defaultRules = ['required', 'email', 'tel', 'url'];

    const rules = defaultRules.reduce((inputRules, rule) => {
        const newRules = {};
        const newRule = input.hasAttribute(rule) || input.type === rule || input.classList.contains(rule);

        if (newRule) {
            newRules[rule] = newRule;
        }

        return {
            ...inputRules,
            ...newRules,
        };
    }, {});

    const regexp = input.hasAttribute('pattern') ? new RegExp(input.getAttribute('pattern')) : undefined;
    const step = input.hasAttribute('step') ? parseInt(input.getAttribute('step'), 10) : undefined;

    if (input.type === 'date') {
        const min = input.hasAttribute('min') ? new Date(input.getAttribute('min')) : undefined;
        const max = input.hasAttribute('max') ? new Date(input.getAttribute('max')) : undefined;
        if (min) rules.minDate = min;
        if (max) rules.maxDate = max;
    } else {
        const min = input.hasAttribute('min') ? parseInt(input.getAttribute('min'), 10) : undefined;
        const max = input.hasAttribute('max') ? parseInt(input.getAttribute('max'), 10) : undefined;
        if (min) rules.min = min;
        if (max) rules.max = max;
    }

    if (regexp) rules.regexp = regexp;
    if (step) rules.step = step;

    return rules;
}
