export class MultiEntryCache<T> {
    private readonly map = new Map<unknown, T[]>();
    private readonly readIndex = new Map<unknown, number>();

    public constructor(entries: [unknown, T][] | null = null) {
        if (entries) {
            this.addRange(entries);
        }
    }

    public addRange(entries: [unknown, T][]) {
        for (const [key, value] of entries) {
            this.add(key, value);
        }
    }

    public add(key: unknown, value: T) {
        let list = this.map.get(key);
        if (!list) {
            list = [];
            this.map.set(key, list);
        }
        list.push(value);
    }

    public get(key: unknown) {
        const list = this.map.get(key);
        if (!list) return undefined;

        const index = this.readIndex.get(key) ?? 0;
        if (index >= list.length) return undefined;

        const result = list[index];
        this.readIndex.set(key, index + 1);
        return result;
    }

    public reset() {
        this.readIndex.clear();
    }

    public clear() {
        this.map.clear();
        this.readIndex.clear();
    }
}
