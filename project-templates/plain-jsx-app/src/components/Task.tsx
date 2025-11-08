import { Show, task, type FunctionalComponent } from '@cleansimple/plain-jsx';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Divider } from './ui/Divider';
import { Header } from './ui/Header';

const Task: FunctionalComponent = () => {
    const { value, isCompleted, rerun } = task(async () => {
        await new Promise(resolve => setTimeout(resolve, 2000));

        return 'Hello World!';
    });

    return (
        <Card>
            <Header>Task</Header>
            <Show when={isCompleted}>
                <Button onClick={rerun}>Rerun</Button>
            </Show>
            <Divider />
            <Show when={isCompleted} fallback={<span>Loading...</span>}>
                <span>Result: {value}</span>
            </Show>
        </Card>
    );
};

export { Task };
