import { type FunctionalComponent, onMount, onUnmount, val } from '@cleansimple/plain-jsx';

const Timer: FunctionalComponent = () => {
    const timer = val('0');
    const start = performance.now();
    let timerInterval: number;

    onMount(() => {
        timerInterval = setInterval(() => {
            timer.value = ((performance.now() - start) / 1000).toFixed(1);
        }, 100);
    });

    onUnmount(() => {
        clearInterval(timerInterval);
    });

    return timer;
};

export { Timer };
