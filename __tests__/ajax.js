import { ajax } from '../src/lib/ajax';

describe('Ajax', () => {
    it('Should work GET', () => {
        const options = {
            method: 'GET',
            url: '/',
            data: 'hello=2',
            sendType: 'serialize',
            enctype: 'enctype',
        };

        const translate = jest.fn();
        const RequestType = function RequestType() {};

        RequestType.prototype.open = jest.fn();
        RequestType.prototype.setRequestHeader = jest.fn();
        RequestType.prototype.send = jest.fn();

        ajax(options, translate, RequestType);

        expect(RequestType.prototype.open).toHaveBeenCalledWith('GET', '/?hello=2', true);
        expect(RequestType.prototype.setRequestHeader).toHaveBeenCalledWith('Content-type', 'enctype');
        expect(RequestType.prototype.send).toHaveBeenCalledWith('');
    });

    it('Should work POST', () => {
        const options = {
            method: 'POST',
            url: '/',
            data: '{}',
            sendType: 'json',
            enctype: 'enctype',
        };

        const translate = jest.fn();
        const RequestType = function RequestType() {};

        RequestType.prototype.open = jest.fn();
        RequestType.prototype.setRequestHeader = jest.fn();
        RequestType.prototype.send = jest.fn();

        ajax(options, translate, RequestType);

        expect(RequestType.prototype.open).toHaveBeenCalledWith('POST', '/', true);
        expect(RequestType.prototype.setRequestHeader).toHaveBeenCalledWith('Content-type', 'application/json; charset=utf-8');
        expect(RequestType.prototype.send).toHaveBeenCalledWith('{}');
    });
});
