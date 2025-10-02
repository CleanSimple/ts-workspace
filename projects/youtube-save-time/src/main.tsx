import { render } from '@cleansimple/plain-jsx';
import { SaveTimeButton } from './SaveTimeButton';

const observer = new MutationObserver(onPageContentChanged);
observer.observe(document.body, { childList: true, subtree: true });

function saveTime() {
    const url = new URL(window.location.href);
    if (!url.toString().includes('watch?')) return;

    const video = document.querySelector('video');
    if (!video) return;

    const time = Math.floor(video.currentTime);

    const newUrl = new URL(url);
    newUrl.searchParams.set('t', `${time}s`);
    if (newUrl.toString() !== url.toString()) {
        window.history.pushState(null, '', newUrl);
    }
}

function onPageContentChanged() {
    addButton();
}

function addButton() {
    if (document.querySelector('#save-time-button-container')) {
        return;
    }

    render(
        document.body,
        <div
            id='save-time-button-container'
            style={{
                position: 'fixed',
                left: '5px',
                bottom: '5px',
                borderRadius: '50%',
                backgroundColor: 'var(--yt-spec-additive-background)',
                zIndex: '100000',
            }}
        >
            <SaveTimeButton onClick={saveTime} />
        </div>,
    );
}
