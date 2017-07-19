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
    });

    it('convertNameToPath', () => {
        assert.deepEqual(convertNameToPath('parent[child]'), ['parent', 'child', '']);
    });

    describe('convertData', () => {
        it('serialize', () => {
            assert.deepEqual(convertData(data, 'serialize'), 'phone=92356234&phone2=sdfsefef&radio=2&parent[child]=value');
        });
    });
});