/**
 * Sending request
 * @param {Object} options - Sending options
 * @param {string} options.url
 * @param {string} options.enctype - Sending options
 * @param {string} options.sendType - Sending options
 * @param {string} options.method - Sending options
 * @param {string|FormData} options.data - Sending options
 * @param {function} translate
 * @param {function} RequestType
 * @returns {Promise}
 * todo rewrite to fetch
 */
export function ajax(options, translate, RequestType = XMLHttpRequest) {
    return new Promise((resolve, reject) => {
        const xhr = new RequestType();

        const url = options.url + (options.method.toUpperCase() === 'GET' && options.data ? (`?${options.data}`) : '');

        xhr.open(options.method, url, true);

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
                        response.validationErrors = { base: [translate('JSON parsing error')] };
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
    });
}

export default ajax;
