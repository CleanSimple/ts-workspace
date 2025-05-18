import { renderElement } from '@lib/plain-jsx/jsx-runtime';
import { sleep } from '@lib/utils';
import { TestUI } from './UI';

async function main() {
    // comment
    console.info('Hi!');
    await sleep(1000);
    console.info('Bye!');

    document.body.appendChild(renderElement(<TestUI />));
}

void main();
