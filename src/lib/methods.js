export default {
    required: {
        func: (value) => {
            if (!value) return false;
            if (Array.isArray(value) && value.length === 0) return false;
            if (value instanceof FileList && value.length === 0) return false;
            if (typeof value === 'string' && value.trim() === '') return false;

            return true;
        },
        message: 'This field is required',
    },
    regexp: {
        func: (value, regexp) => regexp.test(value),
        message: 'Please, provide correct value',
    },
    email: {
        func: value => /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(value),
        message: 'This email is incorrect',
    },
    filesize: {
        func: (value, size) => [...value].reduce((r, file) => file.size < size && r, true), // eslint-disable-line max-len
        message: 'This file is too large',
    },
    extension: {
        func: (value, extensions) => [...value].reduce((r, file) => extensions.indexOf(file.name.split('.').pop()) !== -1 && r, true), // eslint-disable-line max-len
        message: 'This extension is not supported',
    },
    tel: {
        func: value => /^([+]+)*[0-9\x20\x28\x29-]{5,20}$/.test(value),
        message: 'This phone number is incorrect',
    },
    url: {
        func: value => /[-a-zA-Z0-9@:%_+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_+.~#?&//=]*)?/gi.test(value), // eslint-disable-line max-len
        message: 'Wrong url',
    },
};
