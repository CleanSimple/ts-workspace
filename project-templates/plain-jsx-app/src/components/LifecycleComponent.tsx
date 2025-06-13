import { type FunctionalComponent, type ParentComponent, ref, val } from '@lib/plain-jsx';

interface LifecycleComponentProps extends ParentComponent {
    name?: string;
}

let count = 0;

const LifecycleComponent: FunctionalComponent<LifecycleComponentProps> = (
    { name, children },
) => {
    name = name ?? `LifecycleComponent ${++count}`;

    const span = ref<HTMLButtonElement>();
    const title = val(name);

    return <span ref={span} title={title}>{children}</span>;
};

export { LifecycleComponent };
