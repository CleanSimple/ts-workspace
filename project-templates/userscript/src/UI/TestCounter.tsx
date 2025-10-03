import { type FunctionalComponent, ref } from '@cleansimple/plain-jsx';
import type { Action } from '@cleansimple/utils-js';

interface TestCounterRefType {
    increment: Action;
    decrement: Action;
    get count(): number;
}

interface TestCounterProps {
    initialValue?: number;
}

const TestCounter: FunctionalComponent<TestCounterProps, TestCounterRefType> = (
    { initialValue: initialCount = 1 },
    { defineRef },
) => {
    let count: number = initialCount;
    const countElem = ref<HTMLElement>();

    const setCount = (newCount: number) => {
        count = newCount;
        if (!countElem.value) return;
        countElem.value.textContent = count.toString();
    };
    const increment = () => setCount(count + 1);
    const decrement = () => setCount(count - 1);

    defineRef({
        increment,
        decrement,
        get count() {
            return count;
        },
    });

    return <span ref={countElem}>{count}</span>;
};

export { TestCounter };
