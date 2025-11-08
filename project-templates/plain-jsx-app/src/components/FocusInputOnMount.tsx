import { onMount, ref, type FunctionalComponent } from '@cleansimple/plain-jsx';
import { Card } from './ui/Card';
import { Divider } from './ui/Divider';
import { Header } from './ui/Header';

const FocusInputOnMount: FunctionalComponent = () => {
    const inputRef = ref<HTMLInputElement>();

    onMount(() => {
        inputRef.value?.focus();
    });

    return (
        <Card>
            <Header>Focus Input On Mount</Header>
            <Divider />
            <input ref={inputRef} />
        </Card>
    );
};

export { FocusInputOnMount };
