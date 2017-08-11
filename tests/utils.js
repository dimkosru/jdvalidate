import should from 'should';

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

            should(field.classList.contains('error')).be.true();
            should(field.classList.contains('valid')).be.false();
            should(message.innerHTML).be.equal('hello');
        });

        it('should mark valid', () => {
            markField(field, message, classes);

            should(field.classList.contains('error')).be.false();
            should(field.classList.contains('valid')).be.true();
            should(message.innerHTML).be.equal('');
        });
    });

    describe('initErrorMessages', () => {
        it('should return empty object if all params empty', () => {
            const rules = {};
            const messages = {};
            const methods = {};

            should(initErrorMessages(rules, messages, methods)).be.deepEqual({});
        });

        it('should get messages from messages', () => {
            const rules = { phone: { tel: true } };
            const messages = { phone: { tel: 'hello it`s me' } };
            const methods = { tel: { message: 'hello it`s me from method' } };

            should(initErrorMessages(rules, messages, methods)).be.deepEqual({
                phone: {
                    tel: 'hello it`s me',
                },
            });
        });

        it('should get messages from methods', () => {
            const rules = { phone: { tel: true } };
            const messages = {};
            const methods = { tel: { message: 'hello it`s me from method' } };

            should(initErrorMessages(rules, messages, methods)).be.deepEqual({
                phone: {
                    tel: 'hello it`s me from method',
                },
            });
        });
    });
});
