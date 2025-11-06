import './style.css';
import viteLogo from '/vite.svg';
import {
    For,
    type FunctionalComponent,
    onMount,
    render,
    Show,
    subscribe,
    val,
    With,
    WithMany,
} from '@cleansimple/plain-jsx';
import { Counter, type CounterRefType } from './components/Counter';
import { Fragments } from './components/Fragments';
import { Input } from './components/Input';
import { LifecycleComponent } from './components/LifecycleComponent';
import { ParentComponent } from './components/ParentComponent';
import { Timer } from './components/Timer';
import typescriptLogo from './typescript.svg';

const App: FunctionalComponent = () => {
    const showDynamicComponents = val(false);
    const items1 = val([1, 2, 3]);
    const items2 = val(['Test1']);
    const counter = val<CounterRefType | null>(null);
    const switchValue = val(0);
    const key = val(0);

    setInterval(() => {
        switchValue.value += 1;
    }, 1000);

    function toggleDynamicComponents() {
        showDynamicComponents.value = !showDynamicComponents.value;
    }

    function addItem1() {
        items1.value = [...items1.value, items1.value.length + 1];
    }

    function removeItem1() {
        items1.value.pop();
        items1.value = [...items1.value];
    }

    function addItem2() {
        items2.value = [...items2.value, `Test${items2.value.length + 1}`];
    }

    function removeItem2() {
        items2.value.pop();
        items2.value = [...items2.value];
    }

    onMount(() => {
        const subscription = subscribe(
            [showDynamicComponents, key],
            (showDynamicComponents, key) => {
                console.log(showDynamicComponents, key);
            },
        );
        return [subscription];
    });

    return (
        <div>
            <a href='https://vite.dev' target='_blank'>
                <img src={viteLogo} class='logo' alt='Vite logo' />
            </a>
            <a href='https://www.typescriptlang.org/' target='_blank'>
                <img src={typescriptLogo} class='logo vanilla' alt='TypeScript logo' />
            </a>
            <h1>Vite + TypeScript</h1>
            <div class='card'>
                <div style={{ display: 'flex', flexFlow: 'column', gap: '0.5rem' }}>
                    <span>Test Components:</span>
                    <Counter ref={counter} />
                    <button on:click={() => counter.value?.increment()}>Increment Counter</button>
                    <Input type='text' focus={true} value='Input with focus' />
                    <button on:click={toggleDynamicComponents}>Toggle Dynamic Components</button>
                    <button on:click={() => key.value += 1}>Increment Key</button>
                    <div style={{ display: 'flex', flexFlow: 'row', gap: '0.5rem' }}>
                        <button on:click={addItem1}>Add Dynamic Child 1</button>
                        <button on:click={addItem2}>Add Dynamic Child 2</button>
                    </div>
                    <div style={{ display: 'flex', flexFlow: 'row', gap: '0.5rem' }}>
                        <button on:click={removeItem1}>Remove Dynamic Child 1</button>
                        <button on:click={removeItem2}>Remove Dynamic Child 2</button>
                    </div>

                    <Fragments />
                </div>
            </div>
            <div class='card'>
                <div style={{ display: 'flex', flexFlow: 'column', gap: '0.5rem' }}>
                    <span>Dynamic Components:</span>
                    <Show when={showDynamicComponents}>
                        <LifecycleComponent name='Component'>
                            Component <Timer />
                        </LifecycleComponent>
                    </Show>
                    <Show when={showDynamicComponents}>
                        {() => (
                            <LifecycleComponent name='Callback'>
                                Callback <Timer />
                            </LifecycleComponent>
                        )}
                    </Show>
                    <Show when={showDynamicComponents} fallback={<span>Fallback</span>}>
                        <span>Shown</span>
                    </Show>

                    <Show when={key} keyed>
                        <span>
                            Show Keyed <Timer />
                        </span>
                    </Show>

                    <With value={switchValue}>
                        {(value) => {
                            switch (value % 4) {
                                case 0:
                                    return <span>yay!</span>;
                                case 1:
                                    return <span>wow!</span>;
                                case 2:
                                    return <span>lol!</span>;
                                default:
                                    return <span>hmm!</span>;
                            }
                        }}
                    </With>

                    <WithMany values={[showDynamicComponents, key]}>
                        {(showDynamicComponents, key) => (
                            showDynamicComponents && key && (
                                <span>
                                    showDynamicComponents: {String(showDynamicComponents)}, key: {key}
                                </span>
                            )
                        )}
                    </WithMany>

                    <ParentComponent>
                        <ParentComponent>
                            <For of={items1}>
                                {({ item, index }) => (
                                    <span>
                                        {index}. Item: {item}
                                    </span>
                                )}
                            </For>
                            <For of={items2}>
                                {({ item, index }) => (
                                    <span>
                                        {index}. Item: {item}
                                    </span>
                                )}
                            </For>
                        </ParentComponent>
                    </ParentComponent>
                </div>
                <template shadowRootMode='open'>
                    <button>test</button>
                </template>
            </div>
            <p class='read-the-docs'>
                Click on the Vite and TypeScript logos to learn more
            </p>
        </div>
    );
};

const root = document.querySelector<HTMLDivElement>('#app')!;
render(root, <App />);
