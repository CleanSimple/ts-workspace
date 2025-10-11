import type { Observable } from '@cleansimple/plain-jsx';
import { ref } from '@cleansimple/plain-jsx';
import type { JSX } from '@cleansimple/plain-jsx/jsx-runtime';

interface UpDownProps extends JSX.PropsOf<HTMLDivElement> {
    value?: Observable<number> | number;
    minValue?: number;
    maxValue?: number;
}

export function UpDown({ value = 1, minValue = 0, maxValue = 99, ...props }: UpDownProps) {
    const inputRef = ref<HTMLInputElement>();

    function increment() {
        const { value: input } = inputRef;
        if (!input) throw new Error();

        const value = Math.min(maxValue, input.valueAsNumber + 1);
        if (value != input.valueAsNumber) {
            input.valueAsNumber = value;
            input.dispatchEvent(new Event('change', { bubbles: true }));
        }
    }
    function decrement() {
        const { value: input } = inputRef;
        if (!input) throw new Error();

        const value = Math.max(minValue, input.valueAsNumber - 1);
        if (value != input.valueAsNumber) {
            input.valueAsNumber = value;
            input.dispatchEvent(new Event('change', { bubbles: true }));
        }
    }

    return (
        <div class='up-down-control' {...props}>
            <input ref={inputRef} type='number' disabled valueAsNumber={value} min='0' />
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
}
