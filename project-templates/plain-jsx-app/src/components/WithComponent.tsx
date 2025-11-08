import { val, With, type FunctionalComponent } from '@cleansimple/plain-jsx';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Divider } from './ui/Divider';
import { Header } from './ui/Header';
import { Stack } from './ui/Stack';

const WithComponent: FunctionalComponent = () => {
    const type = val<'Button' | 'Input' | 'Text'>('Text');

    return (
        <Card>
            <Header>With Component</Header>
            <Stack orientation='horizontal'>
                <Button onClick={() => type.value = 'Button'}>Button</Button>
                <Button onClick={() => type.value = 'Input'}>Input</Button>
                <Button onClick={() => type.value = 'Text'}>Text</Button>
            </Stack>
            <Divider />
            <With value={type}>
                {(type) => (
                    <>
                        {type === 'Button' && <button>Button</button>}
                        {type === 'Input' && <input type='text' value='Input' />}
                        {type === 'Text' && <span>Text</span>}
                    </>
                )}
            </With>
        </Card>
    );
};

export { WithComponent };
