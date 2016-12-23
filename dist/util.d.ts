/// <reference types="core-js" />
export declare function getOrCreateMap<X, Y, Z>(map: Map<X, Map<Y, Z>>, key: X): Map<Y, Z>;
export declare function getOrCreateSet<X, Y>(map: Map<X, Set<Y>>, key: X): Set<Y>;
