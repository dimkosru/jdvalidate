import { createCheckableElement } from '../test-utils/utils';

import {
    getData,
    getInputValue,
    getRadioGroupValue,
    getValueByName,
    getValueByPath,
    createObject,
    getInputData,
} from '../src/lib/get-data';

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
    it('createObject', () => {
        assert.deepEqual(createObject(['parent', 'child', ''], 'value'), { parent: { child: 'value' } });
    });

    it('getValueByPath', () => {
        assert.deepEqual(getValueByPath(['parent', 'child'], data), 'value');
    });

    it('getValueByName', () => {
        assert.deepEqual(getValueByName('radio', data), '2');
    });

    it('getRadioGroupValue', () => {
        assert.deepEqual(getRadioGroupValue(inputs.radio), data.radio);
    });

    it('getInputValue', () => {
        assert.deepEqual(getInputValue(inputs.phone), data.phone);
    });

    it('getInputData', () => {
        assert.deepEqual(getInputData(inputs.phone), { phone: data.phone });
    });

    it('getData', () => {
        assert.deepEqual(getData(inputs), data);
    });
});
