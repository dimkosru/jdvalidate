import { createCheckableElement } from '../test-utils/utils';

import {
    convertNameToPath,
    convertData,
    getQueryPart,
} from '../src/lib/convert-data';

const data = {
    phone: '92356234',
    phone2: 'sdfsefef',
    radio: '2',
    array: ['1', '2'],
    parent: {
        child: 'value',
    },
};

const inputs = {
    phone: document.createElement('input'),
    phone2: document.createElement('input'),
    'parent[child]': document.createElement('input'),
    radio: [
        createCheckableElement('radio', 1),
        createCheckableElement('radio', 2, true),
        createCheckableElement('radio', 3),
    ],
};

inputs.phone.name = 'phone';
inputs.phone.value = data.phone;
inputs.phone2.name = 'phone2';
inputs.phone2.value = data.phone2;
inputs['parent[child]'].name = 'parent[child]';
inputs['parent[child]'].value = data.parent.child;

describe('Get data', () => {
    it('getQueryPart', () => {
        expect(getQueryPart('phone', data.phone)).toEqual(`phone=${data.phone}&`);
        expect(getQueryPart('phone', ['1'])).toEqual('phone[]=1&');
        expect(getQueryPart('phone', ['1', '2'])).toEqual('phone[]=1&phone[]=2&');
        expect(getQueryPart('parent', data.parent)).toEqual('parent[child]=value&');
    });

    it('convertNameToPath', () => {
        expect(convertNameToPath('parent[child]')).toEqual(['parent', 'child', '']);
    });

    describe('convertData', () => {
        it('serialize', () => {
            expect(convertData(data, 'serialize')).toEqual('phone=92356234&phone2=sdfsefef&radio=2&array[]=1&array[]=2&parent[child]=value');
            expect(convertData({}, 'serialize')).toEqual('');
        });

        it('json', () => {
            expect(convertData(data, 'json')).toEqual(JSON.stringify(data));
        });

        it('formData', () => {
            function FD() {
                this.data = {};
            }

            FD.prototype.append = function append(name, item) {
                this.data = {
                    ...this.data,
                    [name]: item,
                };
            };

            const files0 = [];
            const files1 = [42];
            const files2 = [23, 42];
            const files3 = [23, 42, 42];

            expect(convertData({ file: files0 }, 'formData', Array, FD).data).toEqual({});
            expect(convertData({ file: files1 }, 'formData', Array, FD).data).toEqual({ file: 42 });
            expect(convertData({ file: files2 }, 'formData', Array, FD).data).toEqual({
                'file[0]': 23,
                'file[1]': 42,
            });
            expect(convertData({ file: files3 }, 'formData', Array, FD).data).toEqual({
                'file[0]': 23,
                'file[1]': 42,
                'file[2]': 42,
            });

            expect(convertData({ file: { lol: 'lal' } }, 'formData', Array, FD).data).toEqual({ 'file[lol]': 'lal' });
            expect(convertData({ file: 'kek' }, 'formData', Array, FD).data).toEqual({ file: 'kek' });
        });
    });
});
