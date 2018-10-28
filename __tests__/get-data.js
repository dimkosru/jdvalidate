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
    date: new Date('2017-10-12'),
    phone: '92356234',
    phone2: 'sdfsefef',
    radio: '2',
    parent: {
        child: 'value',
    },
};


const inputs = {
    date: document.createElement('input'),
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

inputs.date.name = 'date';
inputs.date.type = 'date';
inputs.date.value = '2017-10-12';

describe('Get data', () => {
    it('createObject', () => {
        expect(createObject(['parent', 'child', ''], 'value')).toEqual({ parent: { child: 'value' } });
        expect(createObject(['hello', '[]'], 'value')).toEqual({ hello: ['value'] });
    });

    it('getValueByPath', () => {
        expect(getValueByPath(['parent', 'child'], data)).toEqual('value');
        expect(getValueByPath(['parent'], undefined)).toEqual(''); // todo rly?
    });

    it('getValueByName', () => {
        expect(getValueByName('radio', data)).toEqual('2');
    });

    it('getRadioGroupValue', () => {
        expect(getRadioGroupValue(inputs.radio)).toEqual(data.radio);
        expect(getRadioGroupValue([
            createCheckableElement('radio', 2, true, 'checkbox'),
            createCheckableElement('radio', 3, true, 'checkbox'),
        ])).toEqual(['2', '3']);
    });

    describe('getInputValue', () => {
        it('text', () => {
            expect(getInputValue(inputs.phone)).toEqual(data.phone);
            expect(getInputValue(undefined)).toEqual('');
        });

        it('file', () => {
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            expect(getInputValue(fileInput).length).toEqual(0);
        });

        it('select-one', () => {
            const select = document.createElement('select');
            select.innerHTML = '<option selected value="12">23</option>';

            expect(getInputValue(select)).toEqual('12');
        });

        it('select-one without options', () => {
            const select = document.createElement('select');

            expect(getInputValue(select)).toEqual('');
        });

        it('select-multiple', () => {
            const select = document.createElement('select');
            select.setAttribute('multiple', '');
            select.innerHTML = `
                <option selected value="12">23</option>
                <option selected value="34">45</option>
            `;

            expect(getInputValue(select)).toEqual(['12', '34']);
        });

        it('date', () => {
            const dateInput = document.createElement('date');
            dateInput.type = 'date';
            dateInput.value = '2017-10-12';
            expect(getInputValue(dateInput)).toEqual(new Date('2017-10-12'));
            dateInput.value = '';
            expect(getInputValue(dateInput)).toEqual('');
        });
    });

    it('getInputData', () => {
        expect(getInputData(inputs.phone)).toEqual({ phone: data.phone });
    });

    it('getData', () => {
        expect(getData(inputs)).toEqual(data);
    });
});
