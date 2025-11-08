import { Show, val, type FunctionalComponent } from '@cleansimple/plain-jsx';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Divider } from './ui/Divider';
import { Header } from './ui/Header';
import { Stack } from './ui/Stack';

interface ShowComponentProps {
    keyed?: boolean;
}

const ShowComponent: FunctionalComponent<ShowComponentProps> = ({ keyed }) => {
    const key = val<number>(0);
    const renderCount = val(0);

    const onShow = () => {
        key.value = 1;
    };

    const onHide = () => {
        key.value = 0;
    };

    const onIncrementKey = () => {
        key.value++;
    };

    return (
        <Card>
            <Header>Show Component {keyed ? 'Keyed' : 'Not Keyed'}</Header>
            <span>Render Count: {renderCount}</span>
            <Stack orientation='horizontal'>
                <Button onClick={onShow}>Show</Button>
                <Button onClick={onHide}>Hide</Button>
                <Button onClick={onIncrementKey}>Increment Key</Button>
            </Stack>
            <Divider />
            <Show when={key} keyed={keyed}>
                {() => {
                    renderCount.value++;
                    return <span>Key: {key}</span>;
                }}
            </Show>
        </Card>
    );
};

export { ShowComponent };
