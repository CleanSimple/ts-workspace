class MultiEntryCache {
    map = new Map();
    readIndex = new Map();
    constructor(entries = []) {
        for (const [key, value] of entries) {
            this.add(key, value);
        }
    }
    add(key, value) {
        let list = this.map.get(key);
        if (!list) {
            list = [];
            this.map.set(key, list);
            this.readIndex.set(key, 0);
        }
        list.push(value);
    }
    get(key) {
        const list = this.map.get(key);
        if (!list)
            return undefined;
        const index = this.readIndex.get(key) ?? 0;
        if (index >= list.length)
            return undefined;
        const result = list[index];
        this.readIndex.set(key, index + 1);
        return result;
    }
    reset() {
        for (const key of this.map.keys()) {
            this.readIndex.set(key, 0);
        }
    }
    clear() {
        this.map.clear();
        this.readIndex.clear();
    }
}

export { MultiEntryCache };
