import {
    onMount,
    onCleanup,
    Show,
    val,
    type FunctionalComponent,
    type Signal,
    type Val,
} from '@cleansimple/plain-jsx';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Divider } from './ui/Divider';
import { Stack } from './ui/Stack';
import { Header } from './ui/Header';

interface ComponentProps {
    show: Signal<boolean>;
    state: Val<string>;
}

const Component: FunctionalComponent<ComponentProps> = ({ show, state }) => {
    state.value = 'Render';

    onMount(() => {
        state.value = 'Mounted';
    });

    onCleanup(() => {
        state.value = 'Unmounted';
    });

    return (
        <Show when={show}>
            <div>Component!</div>
        </Show>
    );
};

const Lifecycle: FunctionalComponent = () => {
    const show = val(true);
    const state = val('');
    const mount = val(true);

    const onToggleShow = () => {
        show.value = !show.value;
    };

    const onToggleMount = () => {
        mount.value = !mount.value;
    };

    const toggleShowButtonText = show.computed((value) => (value ? 'Hide' : 'Show'));
    const toggleMountButtonText = mount.computed((value) => (value ? 'Unmount' : 'Mount'));

    return (
        <Card>
            <Header>Lifecycle</Header>
            <span>Status: {state}</span>
            <Stack orientation='horizontal'>
                <Button onClick={onToggleShow}>{toggleShowButtonText}</Button>
                <Button onClick={onToggleMount}>{toggleMountButtonText}</Button>
            </Stack>
            <Divider />
            <Show when={mount}>
                <Component show={show} state={state} />
            </Show>
        </Card>
    );
};

export { Lifecycle };
