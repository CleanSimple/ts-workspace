import type { FunctionalComponent } from '@lib/plain-jsx';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const TestSpan: FunctionalComponent = (props, { onMounted }) => {
    // onMounted(({ defineRef }) => {
    //     defineRef({}); // should be invalid
    // });
    return <span>Test span</span>;
};

export { TestSpan };
