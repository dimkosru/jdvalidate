import {
    validateField,
    validateData,
    isCheckable,
} from '../src/lib/validate-data';
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

function translate(text) {
    return text;
}

describe('Validate data', () => {
    describe('Validate Field', () => {
        it('Pass correct value', () => {
            expect(validateField(rules.phone, methods, data.phone, 'phone', errorMessages, data, translate)).toEqual([]);
        });

        it('Pass incorrect value', () => {
            expect(validateField(rules.phone2, methods, data.phone2, 'phone2', errorMessages, data, translate)).toEqual( [errorMessages.phone2.regexp]);
            expect(validateField({
                ...rules.phone,
                url: null,
            }, methods, 'dfsdf', 'phone', errorMessages, data, translate)).toEqual( ['Only digits available']);
            expect(validateField({
                ...rules.phone,
                lol: true,
            }, methods, data.phone, 'phone', errorMessages, data, translate)).toEqual( ['Method "lol" not found']);
        });
    });

    describe('Validate data', () => {
        it('Validate values', () => {
            // eslint-disable-next-line max-len
            expect(validateData(rules, methods, data, errorMessages, translate)).toEqual( {
                phone: undefined,
                phone2: [errorMessages.phone2.regexp],
            });
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

            expect(validateData(myRules, methods, myData, errorMessages, translate)).toEqual( { dependedInput: ['It is required'] });
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
            expect(validateData(myRules, methods, myData, errorMessages, translate)).toEqual( { dependedInput: undefined });
        });
    });

    describe('is Checkable', () => {
        it('Should return null without params or false', () => {
            expect(isCheckable()).toBe(null);
            expect(isCheckable([], {})).toBe(null);
            expect(isCheckable(false, {})).toBe(null);
            expect(isCheckable([false, 'lol'], {})).toBe(null);
        });

        it('Should return params if params is not array', () => {
            expect(isCheckable('hello', {})).toBe('hello');
            expect(isCheckable(true, {})).toBe(true);
            expect(isCheckable('hello', {})).not.toBe(true);
        });

        it('Should return params if params is not array', () => {
            expect(isCheckable('hello', {})).toBe('hello');
            expect(isCheckable(true, {})).toBe(true);
            expect(isCheckable('hello', {})).not.toBe(true);
        });

        it('Should not throw error if function incorrect', () => {
            expect(() => {
                isCheckable([true, () => {
                    throw new Error('error');
                }], {});
            }).not.toThrow();
        });

        it('Should right calculate', () => {
            expect(isCheckable([true, 'one'], { one: 'value' })).toBe(true);
            expect(isCheckable([true, d => !!d.one], { one: 'value' })).toBe(true);
            expect(isCheckable([true, d => !!d.one, d => !d.two], { one: 'value', two: '' })).toBe(true);
            expect(isCheckable([true, d => !!d.one, d => !d.two], { one: 'value', two: 'value' })).toBe(null);
        });
    });
});
