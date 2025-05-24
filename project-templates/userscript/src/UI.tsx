import { sleep } from '@lib/utils';

export function TestUI() {
    async function handleClick(this: GlobalEventHandlers) {
        const self = this as HTMLButtonElement;
        const text = self.textContent;
        self.textContent = 'Pressed!';
        await sleep(1000);
        self.textContent = text;
    }

    return (
        <div
            style={{
                position: 'fixed',
                left: '0px',
                top: '0px',
                zIndex: '10000',
                width: '100px',
                height: '300px',
            }}
        >
            <>
                <button onClick={handleClick}>
                    Button 1
                </button>
                <button onClick={handleClick}>Button 2</button>
            </>
        </div>
    );
}
