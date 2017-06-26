import { translate } from '../i18n/jedi-validate-i18n.js';

/**
 * Sending request
 * @param {{url: string, enctype: string, sendType: string, method: string, data: string|FormData}} options - Sending options
 * @returns {Promise}
 * todo rewrite to fetch
 */
export function ajax(options) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.open(options.method, options.url + (options.method.toUpperCase() === 'GET' ? (`?${options.data}`) : ''), true);

        if (options.sendType === 'serialize') {
            xhr.setRequestHeader('Content-type', options.enctype);
        } else if (options.sendType === 'json') {
            xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');
        }

        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    let response = {};

                    try {
                        response = JSON.parse(xhr.responseText);
                    } catch (e) {
                        response.validationErrors = { base: [translate('JSON parsing error')] }; // todo rewrite translate now dont work
                    }

                    resolve(response);
                } else {
                    reject({
                        xhr,
                        method: options.method,
                        url: options.url,
                        status: xhr.status,
                        statusText: xhr.statusText,
                    });
                }
            }
        };

        xhr.send(options.method.toUpperCase() === 'POST' ? options.data : '');
    },
    );
}

export default ajax;
