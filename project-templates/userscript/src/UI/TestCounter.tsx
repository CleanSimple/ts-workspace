import type { FunctionalComponent } from '@lib/plain-jsx';
import type { Action } from '@lib/utils';

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
    { onMounted },
) => {
    let count: number = initialCount;
    let countElem: HTMLSpanElement;

    const setCount = (newCount: number) => {
        count = newCount;
        countElem.textContent = count.toString();
    };
    const increment = () => setCount(count + 1);
    const decrement = () => setCount(count - 1);

    onMounted(({ getRef, defineRef }) => {
        countElem = getRef<HTMLSpanElement>('count');

        defineRef({
            increment,
            decrement,
            get count() {
                return count;
            },
        });
    });

    return <span ref='count'>{count}</span>;
};

export { TestCounter };
