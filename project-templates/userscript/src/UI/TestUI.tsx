import type { FunctionalComponent, RefType } from '@cleansimple/plain-jsx';
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
    { onMounted },
) => {
    let counter: RefType<typeof TestCounter>;

    onMounted(({ getRef, defineRef }) => {
        counter = getRef<typeof TestCounter>('counter');

        // should throw since TestSpan does not define a ref type
        // const span = getRef<typeof TestSpan>('span');

        defineRef({
            get count() {
                return counter.count;
            },
        });
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
                <TestCounter ref='counter' />
                <button onClick={() => counter.increment()}>
                    Increment
                </button>
                <button onClick={() => counter.decrement()}>Decrement</button>
                <button onClick={() => alert(counter.count)}>Show count</button>
                <TestSpan ref='span' />
            </>
        </div>
    );
};

export { TestUI as TestUI };
