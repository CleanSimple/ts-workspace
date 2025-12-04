import { computed, val, type FunctionalComponent } from '@cleansimple/plain-jsx';
import { Card } from './ui/Card';
import { Divider } from './ui/Divider';
import { Header } from './ui/Header';
import { Stack } from './ui/Stack';

const ComputedMany: FunctionalComponent = () => {
    const x = val(2);
    const y = val(3);
    const z = val(4);

    const area = computed([x, y], (x, y) => x * y);
    const volume = computed([area, z], (space, count) => space * count);

    return (
        <Card>
            <Header>Computed Many</Header>
            <Stack orientation='horizontal'>
                <span>X:</span>
                <input type='number' valueAsNumber={x} />
                <span>Y:</span>
                <input type='number' valueAsNumber={y} />
                <span>Z:</span>
                <input type='number' valueAsNumber={z} />
            </Stack>
            <Divider />
            <span>Area: {area}</span>
            <span>Volume: {volume}</span>
        </Card>
    );
};

export { ComputedMany };
