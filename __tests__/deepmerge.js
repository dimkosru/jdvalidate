import deepmerge from '../src/lib/deepmerge';

describe('Merge', () => {
    it('Should merge simple objects', () => {
        const first = { a: 'a', b: 'b' };
        const second = { c: 1, d: 2 };

        expect(deepmerge(first, second)).toEqual({
            a: 'a',
            b: 'b',
            c: 1,
            d: 2,
        });
    });

    it('Should merge nested objects', () => {
        const first = { a: 'a', b: { e: 1 } };
        const second = { c: 1, d: 2, b: { f: 2 } };

        expect(deepmerge(first, second)).toEqual({
            a: 'a',
            b: {
                e: 1,
                f: 2,
            },
            c: 1,
            d: 2,
        });
    });

    it('Should merge nested objects 2', () => {
        const first = { a: 'a', b: { e: { z: 1, w: 2 } } };
        const second = { c: 1, d: 2, b: { f: 2, e: { w: 3, r: 23 } } };

        expect(deepmerge(first, second)).toEqual({
            a: 'a',
            b: {
                e: {
                    z: 1,
                    w: 3,
                    r: 23,
                },
                f: 2,
            },
            c: 1,
            d: 2,
        });
    });

    it('Should merge nested empty objects', () => {
        const first = { a: {} };
        const second = {};

        expect(deepmerge(first, second)).toEqual({
            a: {},
        });
    });

    it('Should concat simple arrays', () => {
        const first = ['a', 'b'];
        const second = [1, 2];

        expect(deepmerge(first, second)).toEqual(['a', 'b', 1, 2]);
    });
});
