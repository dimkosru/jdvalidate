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

        it('formData', () => { // fixme
            const fd = new FormData();
            const fileInput = document.createElement('input');
            fileInput.type = 'file';

            assert.deepEqual(convertData({ file: fileInput.fileList }, 'formData'), fd);
            assert.deepEqual(convertData({ file: { lol: 'lal' } }, 'formData'), fd);
        });
    });
});
