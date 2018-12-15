export default function deepmerge(first, second) {
    if (Array.isArray(first)) {
        return [].concat(first).concat(second);
    }

    if (first && first.constructor === Object) {
        return Object.keys(first).reduce(
            (o, key) => ({
                ...o,
                [key]: second ? deepmerge(first[key], second[key]) : first[key],
            }),
            second || {},
        );
    }

    return second || first;
}
