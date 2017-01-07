export type Token = any;

//noinspection JSUnusedGlobalSymbols
export function wrapped<T>(source: T): Token {
    if (!source) throw new Error("Source object can't be null for an instantiated token.");
    return {source};
}

export default Token;