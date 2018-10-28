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
        assert.deepEqual(getQueryPart('phone', data.phone), `phone=${data.phone}&`);
        assert.deepEqual(getQueryPart('phone', ['1']), 'phone[]=1&');
        assert.deepEqual(getQueryPart('phone', ['1', '2']), 'phone[]=1&phone[]=2&');
        assert.deepEqual(getQueryPart('parent', data.parent), 'parent[child]=value&');
    });

    it('convertNameToPath', () => {
        assert.deepEqual(convertNameToPath('parent[child]'), ['parent', 'child', '']);
    });

    describe('convertData', () => {
        it('serialize', () => {
            assert.deepEqual(convertData(data, 'serialize'), 'phone=92356234&phone2=sdfsefef&radio=2&array[]=1&array[]=2&parent[child]=value');
            assert.deepEqual(convertData({}, 'serialize'), '');
        });

        it('json', () => {
            assert.deepEqual(convertData(data, 'json'), JSON.stringify(data));
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

            assert.deepEqual(convertData({ file: files0 }, 'formData', Array, FD).data, {});
            assert.deepEqual(convertData({ file: files1 }, 'formData', Array, FD).data, { file: 42 });
            assert.deepEqual(convertData({ file: files2 }, 'formData', Array, FD).data, {
                'file[0]': 23,
                'file[1]': 42,
            });
            assert.deepEqual(convertData({ file: files3 }, 'formData', Array, FD).data, {
                'file[0]': 23,
                'file[1]': 42,
                'file[2]': 42,
            });

            assert.deepEqual(convertData({ file: { lol: 'lal' } }, 'formData', Array, FD).data, { 'file[lol]': 'lal' });
            assert.deepEqual(convertData({ file: 'kek' }, 'formData', Array, FD).data, { file: 'kek' });
        });
    });
});
