import { val, WithMany, type FunctionalComponent } from '@cleansimple/plain-jsx';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Divider } from './ui/Divider';
import { Header } from './ui/Header';
import { Stack } from './ui/Stack';

const WithManyComponent: FunctionalComponent = () => {
    const a = val(0);
    const b = val(0);
    const c = val(0);
    return (
        <Card>
            <Header>With Many Component</Header>
            <Stack orientation='horizontal'>
                <span>A: {a}</span>
                <span>B: {b}</span>
                <span>C: {c}</span>
            </Stack>
            <Stack orientation='horizontal'>
                <Button onClick={() => a.value++}>Increment A</Button>
                <Button onClick={() => b.value++}>Increment B</Button>
                <Button onClick={() => c.value++}>Increment C</Button>
            </Stack>
            <Divider />
            <WithMany values={[a, b, c]}>
                {(a, b, c) => (
                    <>
                        <span>A + B + C: {a + b + c}</span>
                        <span>A + B - C: {a + b - c}</span>
                        <span>A * B / C: {(a * b / c).toFixed(1)}</span>
                    </>
                )}
            </WithMany>
        </Card>
    );
};
export { WithManyComponent };
