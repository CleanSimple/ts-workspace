import { type FunctionalComponent, val } from '@cleansimple/plain-jsx';

interface CounterProps {
}

export interface CounterRefType {
    increment: () => void;
}

const Counter: FunctionalComponent<CounterProps, CounterRefType> = (
    _props,
    { defineRef },
) => {
    const count = val(0);
    const increment = () => {
        count.value += 1;
    };

    defineRef({ increment });

    return (
        <button type='button' on:click={increment}>
            Count is {count}
        </button>
    );
};

export { Counter };
