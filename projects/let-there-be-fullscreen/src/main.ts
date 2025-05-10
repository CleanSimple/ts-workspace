import { debounce } from '@lib/utils';

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

const observer = new MutationObserver(debounce(addButton, 1000));
observer.observe(document.body, { childList: true, subtree: true });

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
        .filter(iframe => iframe.offsetParent !== null)
        .filter(iframe => iframe.ariaHidden !== 'true')
        .forEach(iframe => {
            iframe.insertAdjacentElement('afterend', createFullScreenButtonForIframe(iframe));
            iframe.dataset['canFullscreen'] = 'true';
        });
}
