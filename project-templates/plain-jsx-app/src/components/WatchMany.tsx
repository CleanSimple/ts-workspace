import { val, watchMany, type FunctionalComponent } from '@cleansimple/plain-jsx';
import { Card } from './ui/Card';
import { Divider } from './ui/Divider';
import { Header } from './ui/Header';
import { Stack } from './ui/Stack';

const WatchMany: FunctionalComponent = () => {
    const num1 = val(0);
    const num2 = val(0);
    const num3 = val(0);
    const log = val<string>('');

    watchMany([num1, num2, num3], (num1, num2, num3) => {
        log.value = `Values changed to: ${num1} ${num2} ${num3}\n` + log.value;
    });

    return (
        <Card>
            <Header>watchMany</Header>
            <Stack orientation='horizontal'>
                <input type='number' valueAsNumber={num1} />
                <input type='number' valueAsNumber={num2} />
                <input type='number' valueAsNumber={num3} />
            </Stack>
            <textarea style={{ height: '80px' }}>
                {log}
            </textarea>
            <Divider />
        </Card>
    );
};

export { WatchMany };
