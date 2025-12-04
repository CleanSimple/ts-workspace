import { val, type FunctionalComponent } from '@cleansimple/plain-jsx';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Divider } from './ui/Divider';
import { Header } from './ui/Header';
import { Stack } from './ui/Stack';

const ComputedSingle: FunctionalComponent = () => {
    const count = val(0);
    const double = count.computed(count => count * 2);
    const quad = double.computed(double => double * 2);

    const increment = () => count.value++;
    const decrement = () => count.value--;

    return (
        <Card>
            <Header>Computed Single</Header>
            <Stack orientation='horizontal'>
                <Button onClick={increment}>Increment</Button>
                <Button onClick={decrement}>Decrement</Button>
            </Stack>
            <Divider />
            <span>Count: {count}</span>
            <span>Double: {double}</span>
            <span>Quad: {quad}</span>
        </Card>
    );
};

export { ComputedSingle };
