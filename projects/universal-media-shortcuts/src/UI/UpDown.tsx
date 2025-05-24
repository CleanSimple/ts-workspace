import { createRef } from '@lib/plain-jsx';
import type { JSX } from '@lib/plain-jsx/jsx-runtime';

interface UpDownProps extends JSX.PropsOf<HTMLElement> {
    value?: number;
    onValueChanged?: (value: number) => void;
}

export function UpDown({ value = 1, onValueChanged, ...props }: UpDownProps) {
    const input = createRef<HTMLInputElement>();

    function increment() {
        if (!input.current) throw new Error();
        value = Math.min(99, value + 1);
        input.current.value = value.toString();
        onValueChanged?.(value);
    }
    function decrement() {
        if (!input.current) throw new Error();
        value = Math.max(0, value - 1);
        console.info(input);
        input.current.value = value.toString();
        onValueChanged?.(value);
    }

    return (
        <div className='up-down-control' {...props}>
            <input
                ref={input}
                type='number'
                disabled
                value={value.toString()}
                min='0'
            />
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    borderLeft: '1px solid #404040',
                }}
            >
                <button className='btn-increment' onClick={increment}>
                    <svg height='7' width='7'>
                        <path d='M0,7 L3.5,0 L7,7 Z' />
                    </svg>
                </button>
                <button className='btn-decrement' onClick={decrement}>
                    <svg height='7' width='7'>
                        <path d='M0,0 L3.5,7 L7,0 Z' />
                    </svg>
                </button>
            </div>
        </div>
    );
}
