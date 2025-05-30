import type { RefType } from '@lib/plain-jsx';
import { render } from '@lib/plain-jsx';
import { sleep } from '@lib/utils';
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
