import { type FunctionalComponent, type JSX, nextTick, ref } from '@cleansimple/plain-jsx';

interface InputProps extends JSX.PropsOf<HTMLInputElement> {
    focus?: boolean;
}

const Input: FunctionalComponent<InputProps, HTMLInputElement> = (
    { focus, ...props },
    { defineRef },
) => {
    const input = ref<HTMLInputElement>();

    input.subscribe((input) => {
        if (!input) return;

        defineRef(input);
        if (focus) {
            nextTick(() => input.focus());
        }
    });

    return <input ref={input} {...props} />;
};

export { Input };
