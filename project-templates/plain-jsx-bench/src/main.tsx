import { For, render, type Val, val } from '@cleansimple/plain-jsx';

const adjectives = [
    'pretty',
    'large',
    'big',
    'small',
    'tall',
    'short',
    'long',
    'handsome',
    'plain',
    'quaint',
    'clean',
    'elegant',
    'easy',
    'angry',
    'crazy',
    'helpful',
    'mushy',
    'odd',
    'unsightly',
    'adorable',
    'important',
    'inexpensive',
    'cheap',
    'expensive',
    'fancy',
];
const colors = [
    'red',
    'yellow',
    'blue',
    'green',
    'pink',
    'brown',
    'purple',
    'brown',
    'white',
    'black',
    'orange',
];
const nouns = [
    'table',
    'chair',
    'house',
    'bbq',
    'desk',
    'car',
    'pony',
    'cookie',
    'sandwich',
    'burger',
    'pizza',
    'mouse',
    'keyboard',
];

const random = (max: number) => Math.round(Math.random() * 1000) % max;

let nextId = 1;
type RowData = { id: number; label: Val<string> };

const buildData = (count: number) => {
    let data: RowData[] = new Array(count);
    for (let i = 0; i < count; i++) {
        const label = val(
            `${adjectives[random(adjectives.length)]} ${colors[random(colors.length)]} ${
                nouns[random(nouns.length)]
            }`,
        );

        data[i] = { id: nextId++, label };
    }
    return data;
};

const Button = ({ id, text, fn }: { id: string; text: string; fn: () => void }) => (
    <div class='col-sm-6 smallpad'>
        <button id={id} class='btn btn-primary btn-block' type='button' on:click={fn}>
            {text}
        </button>
    </div>
);

const Main = () => {
    const data = val<RowData[]>([]);
    const selected = val<number | null>(null);
    const run = () => data.value = buildData(1_000);
    const runLots = () => data.value = buildData(10_000);
    const add = () => data.value = [...data.value, ...buildData(1_000)];
    const update = () => {
        for (let i = 0, d = data.value, len = d.length; i < len; i += 10) {
            d[i].label.value += ' !!!';
        }
    };
    const clear = () => data.value = [];
    const swapRows = () => {
        const list = data.value.slice();
        if (list.length > 998) {
            let item = list[1];
            list[1] = list[998];
            list[998] = item;
            data.value = list;
        }
    };

    // function logRenderTime() {
    //     console.time('animation frame');
    //     requestIdleCallback(() => {
    //         console.timeEnd('animation frame');
    //         logRenderTime();
    //     });
    // }
    // logRenderTime();

    return (
        <div class='container'>
            <div class='jumbotron'>
                <div class='row'>
                    <div class='col-md-6'>
                        <h1>Plain-JSX</h1>
                    </div>
                    <div class='col-md-6'>
                        <div class='row'>
                            <Button id='run' text='Create 1,000 rows' fn={run} />
                            <Button id='runlots' text='Create 10,000 rows' fn={runLots} />
                            <Button id='add' text='Append 1,000 rows' fn={add} />
                            <Button id='update' text='Update every 10th row' fn={update} />
                            <Button id='clear' text='Clear' fn={clear} />
                            <Button id='swaprows' text='Swap Rows' fn={swapRows} />
                        </div>
                    </div>
                </div>
            </div>
            <table class='table table-hover table-striped test-data'>
                <tbody>
                    <For of={data}>
                        {(row) => {
                            let rowId = row.id;
                            return (
                                <tr class:danger={selected.computed((id) => id == rowId)}>
                                    <td class='col-md-1'>
                                        {rowId}
                                    </td>
                                    <td class='col-md-4'>
                                        <a on:click={() => selected.value = rowId}>
                                            {row.label}
                                        </a>
                                    </td>
                                    <td class='col-md-1'>
                                        <a
                                            on:click={() =>
                                                data.value = data.value.toSpliced(
                                                    data.value.findIndex((d) => d.id === rowId),
                                                    1,
                                                )}
                                        >
                                            <span
                                                class='glyphicon glyphicon-remove'
                                                ariaHidden='true'
                                            />
                                        </a>
                                    </td>
                                    <td class='col-md-6' />
                                </tr>
                            );
                        }}
                    </For>
                </tbody>
            </table>
            <span class='preloadicon glyphicon glyphicon-remove' ariaHidden='true' />
        </div>
    );
};

render(document.getElementById('main')!, <Main />);
