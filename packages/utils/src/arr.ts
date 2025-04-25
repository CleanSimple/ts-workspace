export function arrFirst<T>(arr: T[]): T {
    return arr[0];
}

export function arrFirstOr<T>(arr: T[], defaultValue: T | null = null): T | null {
    return arr.length ? arr[0] : defaultValue;
}

export function arrLast<T>(arr: T[]): T {
    return arr[arr.length - 1];
}

export function arrLastOr<T>(arr: T[], defaultValue: T | null = null): T | null {
    return arr.length ? arr[arr.length - 1] : defaultValue;
}

export function arrRemoveAt<T>(arr: T[], index: number): T {
    return arr.splice(index, 1)[0];
}

export function arrInsertAt<T>(arr: T[], index: number, ...items: T[]): void {
    arr.splice(index, 0, ...items);
}

export function arrRemove<T>(arr: T[], item: T): void {
    const index = arr.indexOf(item);
    if (index !== -1) {
        arr.splice(index, 1);
    }
}
