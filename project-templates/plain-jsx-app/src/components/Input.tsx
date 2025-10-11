import { type FunctionalComponent, type JSX, ref } from '@cleansimple/plain-jsx';

interface InputProps extends JSX.PropsOf<HTMLInputElement> {
    focus?: boolean;
}

const Input: FunctionalComponent<InputProps, HTMLInputElement> = (
    { ref: inputRef, focus, ...props },
    { onMount },
) => {
    inputRef = inputRef ?? ref<HTMLInputElement>();

    onMount(() => {
        console.info('Input mounted');
        if (focus) {
            inputRef.value?.focus();
        }
    });

    return <input ref={inputRef} {...props} />;
};

export { Input };
