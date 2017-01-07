import {Expression} from "semiring/abstract-expression/expression";

export class DeferredValue<T>  {
    public expression:Expression<T>;

    constructor(e:Expression<T>){
        this.expression = e;
    }
}