import { sleep } from '@lib/utils';

async function main() {
    // comment
    console.info('Hi!');
    await sleep(1000);
    console.info('Bye!');
}

void main();
