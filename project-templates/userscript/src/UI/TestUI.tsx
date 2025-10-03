import type { FunctionalComponent } from '@cleansimple/plain-jsx';
import { ref } from '@cleansimple/plain-jsx';
import { TestCounter } from './TestCounter';
import { TestSpan } from './TestSpan';

interface TestUIProps {
    uId?: string;
}

interface TestUIRefType {
    get count(): number;
}

const TestUI: FunctionalComponent<TestUIProps, TestUIRefType> = (
    { uId = '1-1' },
    { defineRef },
) => {
    const counter = ref<typeof TestCounter>();

    defineRef({
        get count() {
            return counter.value?.count ?? NaN;
        },
    });

    return (
        <div
            style={{
                position: 'fixed',
                display: 'flex',
                flexDirection: 'column',
                left: '0px',
                top: '0px',
                zIndex: '10000',
                width: '100px',
                height: '300px',
            }}
        >
            <>
                {uId}
                <TestCounter ref={counter} />
                <button on:click={() => counter.value?.increment()}>
                    Increment
                </button>
                <button on:click={() => counter.value?.decrement()}>Decrement</button>
                <button on:click={() => alert(counter.value?.count)}>Show count</button>
                <TestSpan />
            </>
        </div>
    );
};

export { TestUI as TestUI };
