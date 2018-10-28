import {
    initErrorMessages,
    markField,
} from '../src/lib/utils';


describe('utils', () => {
    describe('markField', () => {
        const classes = {
            error: 'error',
            valid: 'valid',
        };

        let field = null;
        let message = null;

        beforeEach(() => {
            field = document.createElement('div');
            message = document.createElement('div');
        });

        it('should mark error', () => {
            markField(field, message, classes, ['hello']);

            expect(field.classList.contains('error')).toBe(true);
            expect(field.classList.contains('valid')).toBe(false);
            expect(message.innerHTML).toBe('hello');
        });

        it('should mark two error', () => {
            markField(field, message, classes, ['hello', 'hello2']);

            expect(field.classList.contains('error')).toBe(true);
            expect(field.classList.contains('valid')).toBe(false);
            expect(message.innerHTML).toBe('hello, hello2');
        });

        it('should mark valid', () => {
            markField(field, message, classes);

            expect(field.classList.contains('error')).toBe(false);
            expect(field.classList.contains('valid')).toBe(true);
            expect(message.innerHTML).toBe('');
        });
    });

    describe('initErrorMessages', () => {
        it('should return empty object if all params empty', () => {
            const rules = {};
            const messages = {};
            const methods = {};

            expect(initErrorMessages(rules, messages, methods)).toEqual({});
        });

        it('should get messages from messages', () => {
            const rules = { phone: { tel: true } };
            const messages = { phone: { tel: 'hello it`s me' } };
            const methods = { tel: { message: 'hello it`s me from method' } };

            expect(initErrorMessages(rules, messages, methods)).toEqual({
                phone: {
                    tel: 'hello it`s me',
                },
            });
        });

        it('should get messages from methods', () => {
            const rules = { phone: { tel: true } };
            const messages = {};
            const methods = { tel: { message: 'hello it`s me from method' } };

            expect(initErrorMessages(rules, messages, methods)).toEqual({
                phone: {
                    tel: 'hello it`s me from method',
                },
            });
        });
    });
});
