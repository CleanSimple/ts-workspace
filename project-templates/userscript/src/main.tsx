import type { RefType } from '@cleansimple/plain-jsx';
import { render } from '@cleansimple/plain-jsx';
import { sleep } from '@cleansimple/utils-js';
import { TestUI } from './UI/TestUI';

async function main() {
    // comment
    console.info('Hi!');
    await sleep(1000);
    console.info('Bye!');

    async function onMounted(ref?: RefType<typeof TestUI>) {
        await sleep(1000);
        console.info('count', ref?.count);
    }

    void render(document.body, <TestUI />, { onMounted });
}

void main();
