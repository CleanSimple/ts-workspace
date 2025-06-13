import {
    type FunctionalComponent,
    type ParentComponent as _ParentComponent,
    val,
} from '@lib/plain-jsx';

interface DynamicChildrenProps extends _ParentComponent {
}

interface DynamicChildrenRefType {
    add: (value: string | number) => void;
    remove: (value: string | number) => void;
}

const ParentComponent: FunctionalComponent<DynamicChildrenProps, DynamicChildrenRefType> = (
    { children },
    { defineRef },
) => {
    const content = val<(string | number)[]>(['Text']);

    function add(value: string | number) {
        content.value = [...content.value, value];
    }

    function remove(value: string | number) {
        content.value = content.value.filter(item => item !== value);
    }

    defineRef({ add, remove });

    return (
        <>
            {children}
        </>
    );
};

export { ParentComponent };
