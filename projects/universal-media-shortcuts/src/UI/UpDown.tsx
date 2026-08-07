import type { FunctionalComponent, PropsOf, Val } from '@cleansimple/plain-jsx';

import { val } from '@cleansimple/plain-jsx';

interface UpDownProps extends PropsOf<HTMLDivElement> {
    value?: Val<number> | number;
    minValue?: number;
    maxValue?: number;
}

export const UpDown: FunctionalComponent<UpDownProps> = (
    { value: initialValue = 1, minValue = 0, maxValue = 99, ...props }: UpDownProps,
) => {
    const value = typeof initialValue === 'number' ? val(initialValue) : initialValue;

    function increment() {
        value.value = Math.min(maxValue, value.value + 1);
    }
    function decrement() {
        value.value = Math.max(minValue, value.value - 1);
    }

    return (
        <div class='up-down-control' {...props}>
            <input type='number' disabled valueAsNumber={value} />
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    borderLeft: '1px solid #404040',
                }}
            >
                <button class='btn-increment' on:click={increment}>
                    <svg:svg height='7' width='7'>
                        <svg:path d='M0,7 L3.5,0 L7,7 Z' />
                    </svg:svg>
                </button>
                <button class='btn-decrement' on:click={decrement}>
                    <svg:svg height='7' width='7'>
                        <svg:path d='M0,0 L3.5,7 L7,0 Z' />
                    </svg:svg>
                </button>
            </div>
        </div>
    );
};
