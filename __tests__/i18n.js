import Dictionary from '../src/i18n/jedi-validate-i18n';

let dictionary = null;

describe('Dictionary', () => {
    beforeEach(() => {
        dictionary = new Dictionary({
            test: {
                test: 'this is a test',
            },
        });
    });

    it('should translate', () => {
        expect(dictionary.translate('Wrong url')).toEqual('Wrong url');
        expect(dictionary.translate('Wrong url', 'ru')).toEqual('Не корректный url');
        expect(dictionary.translate('test', 'test')).toEqual('this is a test');
    });

    it('should return text if has not translation', () => {
        expect(dictionary.translate('test111')).toEqual('test111');
        expect(dictionary.translate('test111', 'ru')).toEqual('test111');
    });

    it('should add translation', () => {
        dictionary.addTranslation('lol', 'lal', 'test');
        dictionary.addTranslation('lol', 'lal default');
        expect(dictionary.translate('lol', 'test')).toEqual('lal');
        expect(dictionary.translate('lol')).toEqual('lal default');
    });

    it('should add translations', () => {
        dictionary.addTranslations({
            test: {
                lol: 'lal',
            },
        });
        expect(dictionary.translate('lol', 'test')).toEqual('lal');
    });
});
