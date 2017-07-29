import should from 'should';

import {
    required,
    regexp,
    email,
    filesize,
    extension,
    tel,
    url,
} from '../src/lib/methods';


describe('Methods', () => {
    describe('required', () => {
        it('Should pass correct data', () => {
            should(required('Hello')).be.true();
            should(required(['hello'])).be.true();
            should(required([''])).be.true(); // todo should it pass empty values in array?
        });

        it('Should not pass incorrect value', () => {
            should(required(undefined)).be.false();
            should(required('  ')).be.false();
            should(required('')).be.false();
            should(required([])).be.false();
        });
    });

    describe('regexp', () => {
        it('Should pass correct data', () => {
            should(regexp('Hello', /^\w+$/)).be.true();
            should(regexp('2342', /^\d+$/)).be.true();
            should(regexp('hello 2342', /^\w+\s.\d+$/)).be.true();
        });

        it('Should not pass incorrect value', () => {
            should(regexp('Hello', /^\d+$/)).be.false();
            should(regexp('2342', /^\D+$/)).be.false();
            should(regexp('hello 2342', /^\d+\s.\w+$/)).be.false();
        });
    });

    describe('email', () => {
        it('Should pass correct data', () => {
            should(email('ddd@dd.dd')).be.true();
        });

        it('Should not pass incorrect value', () => {
            should(email('ddddd.dd')).be.false();
            should(email('привет@ddd.dd')).be.false();
            should(email('gfg@dddd.d')).be.false();
            should(email('gfg@ddddd')).be.false();
            should(email('')).be.false();
            should(email('45345')).be.false();
        });
    });

    describe('filesize', () => {
        it('Should pass correct data', () => {
            should(filesize([{ size: 10 }], 20)).be.true();
            should(filesize([{ size: 10 }, { size: 15 }], 20)).be.true();
        });

        it('Should not pass incorrect value', () => {
            should(filesize([{ size: 10 }], 5)).be.false();
            should(filesize([{ size: 10 }, { size: 15 }], 12)).be.false();
        });
    });

    describe('extension', () => {
        it('Should pass correct data', () => {
            should(extension([{ name: 'lol.png' }], 'png|jpg')).be.true();
            should(extension([{ name: 'lol.png' }, { name: 'lol.jpg' }], 'png|jpg')).be.true();
        });

        it('Should not pass incorrect value', () => {
            should(extension([{ name: 'lol.jpeg' }], 'png|jpg')).be.false();
            should(extension([{ name: 'lol.png' }, { name: 'lol.kek' }], 'png|jpg')).be.false();
        });
    });

    describe('tel', () => {
        it('Should pass correct data', () => {
            should(tel('8800123124')).be.true();
            should(tel('88003124')).be.true();
        });

        it('Should not pass incorrect value', () => {
            should(tel('231')).be.false();
            should(tel('')).be.false();
        });
    });

    describe('url', () => {
        it('Should pass correct data', () => {
            should(url('http://github.com')).be.true();
            should(url('github.com')).be.true();
            should(url('github.com?sdfdf=sdfsd')).be.true();
        });

        it('Should not pass incorrect value', () => {
            should(url('231')).be.false();
            should(url('')).be.false();
            should(url('github')).be.false();
        });

        it.skip('Should pass cyrillic url', () => {
            should(url('http://гитхаб.рф')).be.true();
            should(url('http://гитхаб.рф/?ddd=привет')).be.true();
            should(url('гитхаб.рф')).be.true();
        });
    });
});
