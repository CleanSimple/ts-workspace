import type { FullscreenMessage } from './types';

import { debounce, isElementVisible, isTopFrame } from '@cleansimple/utils-js';

GM_addStyle(`
.ltbf-btn {
  all: unset;
  position: absolute;
  top: 0;
  left: 0;
  margin: 5px;
  padding: 5px;
  border: 1px solid gray;
  border-radius: 5px;
  color: white;
  background: blue;
  z-index: 10000;
}`);

const Magic = 'let-there-be-fullscreen';

const observer = new MutationObserver(debounce(addButton, 1000));
observer.observe(document.body, { childList: true, subtree: true });

if (isTopFrame()) {
    document.addEventListener('fullscreenchange', () => {
        const isFullscreen = document.fullscreenElement !== null;
        broadcastMessage(
            window,
            {
                magic: Magic,
                name: 'fullscreen',
                value: isFullscreen,
            } satisfies FullscreenMessage,
        );
    });
}

window.addEventListener('message', event => {
    if (!isFullscreenEvent(event.data)) {
        return;
    }

    onFullscreenChange(event.data.value);
});

function isFullscreenEvent(value: unknown): value is FullscreenMessage {
    return (value != null && typeof value === 'object' && 'magic' in value
        && value.magic === Magic && 'name' in value && value.name === 'fullscreen');
}

function onFullscreenChange(isFullscreen: boolean) {
    document.querySelectorAll<HTMLButtonElement>('.ltbf-btn').forEach(button => {
        button.style.display = isFullscreen ? 'none' : 'block';
    });
}

function createFullScreenButtonForIframe(iframe: HTMLIFrameElement) {
    const button = document.createElement('button');
    button.textContent = 'Fullscreen!';
    button.className = 'ltbf-btn';
    button.addEventListener('click', () => {
        makeFullscreen(iframe);
    });
    return button;
}

function makeFullscreen(iframe: HTMLIFrameElement) {
    void iframe.requestFullscreen();
}

function addButton() {
    Array.from(document.querySelectorAll('iframe'))
        .filter(iframe => iframe.dataset['canFullscreen'] !== 'true')
        .filter(iframe => isElementVisible(iframe))
        .forEach(iframe => {
            iframe.insertAdjacentElement('afterend', createFullScreenButtonForIframe(iframe));
            iframe.dataset['canFullscreen'] = 'true';
        });
}

function broadcastMessage(win: Window, message: unknown, targetOrigin: string = '*') {
    win.postMessage(message, targetOrigin);

    // eslint-disable-next-line @typescript-eslint/prefer-for-of
    for (let i = 0; i < win.frames.length; i++) {
        broadcastMessage(win.frames[i], message, targetOrigin);
    }
}
