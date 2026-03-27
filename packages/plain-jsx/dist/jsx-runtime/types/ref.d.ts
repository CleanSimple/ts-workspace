interface Ref<T extends object> {
    get current(): T | null;
}

export type { Ref };
