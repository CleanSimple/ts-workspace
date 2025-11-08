import { For, val, type FunctionalComponent } from '@cleansimple/plain-jsx';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Divider } from './ui/Divider';
import { Header } from './ui/Header';
import { Stack } from './ui/Stack';

const ForComponent: FunctionalComponent = () => {
    const items = val<number[]>([]);
    let lastId = 0;

    const onAdd = () => {
        items.value = [...items.value, ++lastId];
    };

    const onRemove = () => {
        items.value = items.value.slice(1);
    };

    return (
        <Card>
            <Header>For Component</Header>
            <Stack orientation='horizontal'>
                <Button onClick={onAdd}>Add</Button>
                <Button onClick={onRemove}>Remove</Button>
            </Stack>
            <Divider />
            <For of={items}>
                {({ item, index }) => <span>{index}.Item Id: {item}</span>}
            </For>
        </Card>
    );
};

export { ForComponent };
