/**
 * Create checkable element (radio or checkbox)
 * @param name
 * @param value
 * @param checked
 * @param type
 * @returns {Element}
 */
export function createCheckableElement(name, value, checked = false, type = 'radio') {
    const checkableInput = document.createElement('input');

    checkableInput.setAttribute('type', type);
    checkableInput.name = name;
    checkableInput.value = value;

    if (checked) {
        checkableInput.setAttribute('checked', 'checked');
    }

    return checkableInput;
}
