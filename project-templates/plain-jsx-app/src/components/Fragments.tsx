import type { FunctionalComponent } from '@cleansimple/plain-jsx';

const Fragments: FunctionalComponent = (_props) => {
    return (
        <>
            <span>Fragments:</span>
            <span>Span 1</span>
            <>
                <span>Span 2</span>
                <span>Span 3</span>
            </>
            <span>Span 4</span>
            <>
                <>
                    <span>Span 5</span>
                </>
            </>
        </>
    );
};

export { Fragments };
