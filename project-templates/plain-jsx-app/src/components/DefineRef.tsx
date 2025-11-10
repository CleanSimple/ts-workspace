import { ref, val, type FunctionalComponent } from '@cleansimple/plain-jsx';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Divider } from './ui/Divider';
import { Header } from './ui/Header';
import { Stack } from './ui/Stack';

interface CounterRef {
    increment(): void;
    decrement(): void;
}

interface CounterProps {
}

const Counter: FunctionalComponent<CounterProps, CounterRef> = (_props, { defineRef }) => {
    const count = val(0);

    defineRef({
        increment() {
            count.value += 1;
        },
        decrement() {
            count.value -= 1;
        },
    });

    return <span>{count}</span>;
};

const DefineRef: FunctionalComponent = () => {
    const counterRef = ref<typeof Counter>();
    return (
        <Card>
            <Header>Define Ref</Header>
            <Stack orientation='horizontal'>
                <Button onClick={() => counterRef.current?.increment()}>Increment</Button>
                <Button onClick={() => counterRef.current?.decrement()}>Decrement</Button>
            </Stack>
            <Divider />
            <Counter ref={counterRef} />
        </Card>
    );
};

export { DefineRef };
