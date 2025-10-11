import { type FunctionalComponent, type ParentComponent, ref, val } from '@cleansimple/plain-jsx';

interface LifecycleComponentProps extends ParentComponent {
    name?: string;
}

let count = 0;

const LifecycleComponent: FunctionalComponent<LifecycleComponentProps> = (
    { name, children },
    { onMount, onUnmount },
) => {
    name = name ?? `LifecycleComponent ${++count}`;

    const span = ref<HTMLButtonElement>();
    const title = val(name);

    onMount(() => {
        console.info('mounted', name);
    });
    onUnmount(() => {
        console.info('unmounted', name);
    });

    return <span ref={span} title={title}>{children}</span>;
};

export { LifecycleComponent };
