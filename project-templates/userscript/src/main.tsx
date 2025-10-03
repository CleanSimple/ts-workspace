import { render } from '@cleansimple/plain-jsx';
import { sleep } from '@cleansimple/utils-js';
import { TestUI } from './UI/TestUI';

async function main() {
    // comment
    console.info('Hi!');
    await sleep(1000);
    console.info('Bye!');

    void render(document.body, <TestUI />);
}

void main();
