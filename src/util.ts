
export function getOrCreateMap<X, Y, Z>(map: Map<X, Map<Y, Z>>, key: X): Map<Y, Z> {
    if (map.has(key))
        return map.get(key);
    else {
        const yToP: Map<Y, Z> = new Map<Y, Z>();
        map.set(key, yToP);
        return yToP;
    }
}

export function getOrCreateSet<X, Y>(map: Map<X, Set<Y>>, key: X): Set<Y> {
    if (map.has(key))
        return map.get(key);
    else {
        const yToP: Set<Y> = new Set<Y>();
        map.set(key, yToP);
        return yToP;
    }
}