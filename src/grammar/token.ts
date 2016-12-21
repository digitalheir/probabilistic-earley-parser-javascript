// export interface Token<T> {
//
// constructor(source: T) {
//     if (!source) throw new Error("Source object can't be null for an instantiated token. Did you mean to create a null token?");
//     this.source = source;
// }
//
// static from<T>(t: T): Token<T> {
//     return new Token(t);
// }
//
// public toString(): string {
//     return this.source.toString();
// }
//
// // @Override
// // public boolean equals(Object o) {
// //     if (this == o) return true;
// //     if (o == null || getClass() != o.getClass()) return false;
// //
// //     Token<?> token = (Token<?>) o;
// //
// //     return obj.equals(token.obj);
// //
// // }
// }

export type Token = any;

//noinspection JSUnusedGlobalSymbols
export function from<T>(source: T): Token {
    if (!source)
        throw new Error("Source object can't be null for an instantiated token.");
    return {source};
}

export default Token;