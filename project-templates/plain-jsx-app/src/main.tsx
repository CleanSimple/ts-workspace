import './style.css';
import viteLogo from '/vite.svg';
import { For, type FunctionalComponent, render, Show, val } from '@cleansimple/plain-jsx';
import { Counter, type CounterRefType } from './components/Counter';
import { Fragments } from './components/Fragments';
import { Input } from './components/Input';
import { LifecycleComponent } from './components/LifecycleComponent';
import { ParentComponent } from './components/ParentComponent';
import { Timer } from './components/Timer';
import typescriptLogo from './typescript.svg';

const App: FunctionalComponent = () => {
    const showDynamicComponent = val(false);
    const items1 = val([1, 2, 3]);
    const items2 = val(['Test1']);
    const counter = val<CounterRefType | null>(null);
    const switchValue = val(0);
    const key = val(0);

    setInterval(() => {
        switchValue.value += 1;
    }, 1000);

    function toggleDynamicCompetent() {
        showDynamicComponent.value = !showDynamicComponent.value;
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
                    <Fragments />
                    <button on:click={toggleDynamicCompetent}>Toggle Dynamic Component</button>
                    <button on:click={() => key.value += 1}>Increment Key</button>
                    <div style={{ display: 'flex', flexFlow: 'row', gap: '0.5rem' }}>
                        <button on:click={addItem1}>Add Dynamic Child 1</button>
                        <button on:click={addItem2}>Add Dynamic Child 2</button>
                    </div>
                    <div style={{ display: 'flex', flexFlow: 'row', gap: '0.5rem' }}>
                        <button on:click={removeItem1}>Remove Dynamic Child 1</button>
                        <button on:click={removeItem2}>Remove Dynamic Child 2</button>
                    </div>
                </div>
            </div>
            <div class='card'>
                <div style={{ display: 'flex', flexFlow: 'column', gap: '0.5rem' }}>
                    <>
                        Fragment
                    </>
                    <span>Dynamic Components:</span>
                    <Show when={showDynamicComponent}>
                        <LifecycleComponent name='Component'>
                            Component <Timer />
                        </LifecycleComponent>
                    </Show>
                    <Show when={showDynamicComponent}>
                        {() => (
                            <LifecycleComponent name='Callback'>
                                Callback <Timer />
                            </LifecycleComponent>
                        )}
                    </Show>

                    <span>
                        <Show when={key} keyed>
                            Show Keyed <Timer />
                        </Show>
                    </span>
                    <span>
                        <Show when={switchValue} is={(value) => value % 3 === 0}>
                            yay!
                        </Show>
                        <Show when={switchValue} is={(value) => value % 3 === 1}>
                            wow!
                        </Show>
                        <Show when={switchValue} is={(value) => value % 3 === 2}>
                            lol!
                        </Show>
                    </span>

                    <ParentComponent>
                        <ParentComponent>
                            <For of={items1}>
                                {({ item, index }) => (
                                    <span>
                                        {index}. Item: {item} <Timer />
                                    </span>
                                )}
                            </For>
                            <>
                                <For of={items2}>
                                    {({ item, index }) => (
                                        <span>
                                            {index}. Item: {item} <Timer />
                                        </span>
                                    )}
                                </For>
                            </>
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
