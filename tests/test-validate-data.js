import { validateField, validateData } from '../src/lib/validate-data';
import methods from '../src/lib/methods';

// todo move to test context
const rules = {
    phone: {
        required: true,
        regexp: /^\d*$/,
    },
    phone2: {
        regexp: /^\d*$/,
    },
};

const data = {
    phone: '92356234',
    phone2: 'sdfsefef',
};

const inputs = {
    phone: document.createElement('input'),
    phone2: document.createElement('input'),
};

inputs.phone.name = 'phone';
inputs.phone.value = data.phone;
inputs.phone2.name = 'phone2';
inputs.phone2.value = data.phone2;

const errorMessages = {
    phone: {
        required: 'It is required',
        regexp: 'Only digits available',
    },
    phone2: {
        regexp: 'Only digits available',
    },
    dependedInput: {
        required: 'It is required',
    },
};

describe('Validate data', () => {
    describe('Validate Field', () => {
        it('Pass correct value', () => {
            assert.deepEqual(validateField(rules.phone, methods, data.phone, 'phone', errorMessages, data), []);
        });

        it('Pass incorrect value', () => {
            assert.deepEqual(validateField(rules.phone2, methods, data.phone2, 'phone2', errorMessages, data), [errorMessages.phone2.regexp]);
        });
    });

    describe('Validate data', () => {
        it('Validate values', () => {
            // eslint-disable-next-line max-len
            assert.deepEqual(validateData(rules, methods, data, errorMessages), { phone: undefined, phone2: [errorMessages.phone2.regexp] });
        });
    });

    describe('Depends data', () => {
        it('Validate invalid values', () => {
            const myRules = {
                dependedInput: {
                    required: [true, 'checkbox'],
                },
            };

            const myData = {
                checkbox: 'true',
                dependedInput: '',
            };

            assert.deepEqual(validateData(myRules, methods, myData, errorMessages), { dependedInput: ['It is required'] });
        });

        it('Validate valid values', () => {
            const myRules = {
                dependedInput: {
                    required: [true, 'checkbox'],
                },
            };

            const myData = {
                checkbox: '',
                dependedInput: '',
            };

            // eslint-disable-next-line max-len
            assert.deepEqual(validateData(myRules, methods, myData, errorMessages), { dependedInput: undefined });
        });
    });
});
