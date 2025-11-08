import { val, watch, type FunctionalComponent } from '@cleansimple/plain-jsx';
import { Card } from './ui/Card';
import { Divider } from './ui/Divider';
import { Header } from './ui/Header';

const Watch: FunctionalComponent = () => {
    const value = val<string>('');
    const log = val<string>('');

    watch(value, (value) => {
        log.value = `Value changed to: ${value}\n` + log.value;
    });

    return (
        <Card>
            <Header>watch</Header>
            <input value={value} />
            <Divider />
            <textarea style={{ height: '80px' }}>
                {log}
            </textarea>
        </Card>
    );
};

export { Watch };
