import { sleep } from '@cleansimple/utils-js';

async function main() {
    // comment
    console.info('Hi!');
    await sleep(1000);
    console.info('Bye!');
}

void main();
