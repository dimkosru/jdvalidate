import should from 'should';

import {
    getFormOptions,
    getInputRules,
} from '../src/lib/get-options';


let form = null;
let input = null;

describe('Get options', () => {
    describe('getFormOptions', () => {
        beforeEach(() => {
            form = document.createElement('form');
        });

        it('Should work', () => {
            form.setAttribute('enctype', 'application/x-www-form-urlencoded');
            form.setAttribute('action', 'hello.kitty');
            form.setAttribute('method', 'POST');

            should(getFormOptions(form)).be.deepEqual({
                ajax: {
                    enctype: 'application/x-www-form-urlencoded',
                    url: 'hello.kitty',
                    method: 'POST',
                    sendType: undefined,
                },
            });
        });

        it('Should work with form data', () => {
            form.setAttribute('enctype', 'multipart/form-data');
            form.setAttribute('action', 'hello.kitty');
            form.setAttribute('method', 'POST');

            should(getFormOptions(form)).be.deepEqual({
                ajax: {
                    enctype: 'multipart/form-data',
                    url: 'hello.kitty',
                    method: 'POST',
                    sendType: 'formData',
                },
            });
        });
    });

    describe('getInputRules', () => {
        beforeEach(() => {
            input = document.createElement('input');
        });

        it('Should return empty', () => {
            should(getInputRules(input)).be.deepEqual({});
        });

        it('Should return required', () => {
            input.setAttribute('required', '');

            should(getInputRules(input)).be.deepEqual({ required: true });
        });

        it('Should return email by type', () => {
            input.setAttribute('type', 'email');

            should(getInputRules(input)).be.deepEqual({ email: true });
        });

        it('Should return url by class', () => {
            input.setAttribute('class', 'url');

            should(getInputRules(input)).be.deepEqual({ url: true });
        });

        it('Should return regexp', () => {
            input.setAttribute('pattern', '123');

            should(getInputRules(input)).be.deepEqual({ regexp: new RegExp('123') });
        });
    });
});
