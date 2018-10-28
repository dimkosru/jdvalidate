import {
    required,
    regexp,
    email,
    filesize,
    extension,
    tel,
    url,
    min,
    max,
    minDate,
    maxDate,
    step,
} from '../src/lib/methods';


describe('Methods', () => {
    describe('required', () => {
        it('Should pass correct data', () => {
            expect(required('Hello')).toBe(true);
            expect(required(['hello'])).toBe(true);
            expect(required([''])).toBe(true); // todo should it pass empty values in array?
        });

        it('Should not pass incorrect value', () => {
            expect(required(undefined)).toBe(false);
            expect(required('  ')).toBe(false);
            expect(required('')).toBe(false);
            expect(required([])).toBe(false);
        });
    });

    describe('regexp', () => {
        it('Should pass correct data', () => {
            expect(regexp('Hello', /^\w+$/)).toBe(true);
            expect(regexp('2342', /^\d+$/)).toBe(true);
            expect(regexp('hello 2342', /^\w+\s.\d+$/)).toBe(true);
        });

        it('Should not pass incorrect value', () => {
            expect(regexp('Hello', /^\d+$/)).toBe(false);
            expect(regexp('2342', /^\D+$/)).toBe(false);
            expect(regexp('hello 2342', /^\d+\s.\w+$/)).toBe(false);
        });
    });

    describe('email', () => {
        it('Should pass correct data', () => {
            expect(email('ddd@dd.dd')).toBe(true);
        });

        it('Should not pass incorrect value', () => {
            expect(email('ddddd.dd')).toBe(false);
            expect(email('привет@ddd.dd')).toBe(false);
            expect(email('gfg@dddd.d')).toBe(false);
            expect(email('gfg@ddddd')).toBe(false);
            expect(email('')).toBe(false);
            expect(email('45345')).toBe(false);
        });
    });

    describe('filesize', () => {
        it('Should pass correct data', () => {
            expect(filesize([{ size: 10 }], 20)).toBe(true);
            expect(filesize([{ size: 10 }, { size: 15 }], 20)).toBe(true);
            expect(filesize([{ size: 15 }], 15)).toBe(true);
        });

        it('Should not pass incorrect value', () => {
            expect(filesize([{ size: 10 }], 5)).toBe(false);
            expect(filesize([{ size: 10 }, { size: 15 }], 12)).toBe(false);
        });
    });

    describe('extension', () => {
        it('Should pass correct data', () => {
            expect(extension([{ name: 'lol.png' }], 'png|jpg')).toBe(true);
            expect(extension([{ name: 'lol.png' }, { name: 'lol.jpg' }], 'png|jpg')).toBe(true);
        });

        it('Should not pass incorrect value', () => {
            expect(extension([{ name: 'lol.jpeg' }], 'png|jpg')).toBe(false);
            expect(extension([{ name: 'lol.png' }, { name: 'lol.kek' }], 'png|jpg')).toBe(false);
        });
    });

    describe('tel', () => {
        it('Should pass correct data', () => {
            expect(tel('8800123124')).toBe(true);
            expect(tel('88003124')).toBe(true);
        });

        it('Should not pass incorrect value', () => {
            expect(tel('231')).toBe(false);
            expect(tel('')).toBe(false);
        });
    });

    describe('url', () => {
        it('Should pass correct data', () => {
            expect(url('http://github.com')).toBe(true);
            expect(url('github.com')).toBe(true);
            expect(url('github.com?sdfdf=sdfsd')).toBe(true);
        });

        it('Should not pass incorrect value', () => {
            expect(url('231')).toBe(false);
            expect(url('')).toBe(false);
            expect(url('github')).toBe(false);
        });

        it.skip('Should pass cyrillic url', () => {
            expect(url('http://гитхаб.рф')).toBe(true);
            expect(url('http://гитхаб.рф/?ddd=привет')).toBe(true);
            expect(url('гитхаб.рф')).toBe(true);
        });
    });

    describe('min', () => {
        it('Should pass correct data', () => {
            expect(min(10, 5)).toBe(true);
            expect(min(5, 5)).toBe(true);
        });

        it('Should not pass incorrect value', () => {
            expect(min(1, 5)).toBe(false);
            expect(min(1111, 5000)).toBe(false);
        });
    });

    describe('max', () => {
        it('Should pass correct data', () => {
            expect(max(10, 50)).toBe(true);
            expect(max(5, 5)).toBe(true);
            expect(max(5, 5)).toBe(true);
        });

        it('Should not pass incorrect value', () => {
            expect(max(5, 1)).toBe(false);
            expect(max(5000, 1111)).toBe(false);
        });
    });

    describe('step', () => {
        it('Should pass correct data', () => {
            expect(step(5, 5)).toBe(true);
            expect(step(100, 10)).toBe(true);
        });

        it('Should not pass incorrect value', () => {
            expect(step(5, 12)).toBe(false);
            expect(step(4, 3)).toBe(false);
        });
    });

    describe('min date', () => {
        it('Should pass correct data', () => {
            expect(minDate(new Date('2017/10/12'), new Date('2017/10/10'))).toBe(true);
        });

        it('Should not pass incorrect value', () => {
            expect(minDate(new Date('2017/10/12'), new Date('2017/10/13'))).toBe(false);
        });
    });

    describe('max date', () => {
        it('Should pass correct data', () => {
            expect(maxDate(new Date('2017/10/12'), new Date('2017/10/12'))).toBe(true);
        });

        it('Should not pass incorrect value', () => {
            expect(maxDate(new Date('2017/10/12'), new Date('2017/10/10'))).toBe(false);
        });
    });
});
