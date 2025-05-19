import { render } from '@lib/plain-jsx';
import { sleep } from '@lib/utils';
import { TestUI } from './UI';

async function main() {
    // comment
    console.info('Hi!');
    await sleep(1000);
    console.info('Bye!');

    render(document.body, <TestUI />);
}

void main();
