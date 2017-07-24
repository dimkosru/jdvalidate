import should from 'should';
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
        should(dictionary.translate('Wrong url')).be.equal('Wrong url');
        should(dictionary.translate('Wrong url', 'ru')).be.equal('Не корректный url');
        should(dictionary.translate('test', 'test')).be.equal('this is a test');
    });

    it('should return text if has not translation', () => {
        should(dictionary.translate('test111')).be.equal('test111');
        should(dictionary.translate('test111', 'ru')).be.equal('test111');
    });

    it('should add translation', () => {
        dictionary.addTranslation('lol', 'lal', 'test');
        dictionary.addTranslation('lol', 'lal default');
        should(dictionary.translate('lol', 'test')).be.equal('lal');
        should(dictionary.translate('lol')).be.equal('lal default');
    });

    it('should add translations', () => {
        dictionary.addTranslations({
            test: {
                lol: 'lal',
            },
        });
        should(dictionary.translate('lol', 'test')).be.equal('lal');
    });
});
