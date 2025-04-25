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
    // filterOutShortsFromSubscriptions();
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function filterOutShortsFromSubscriptions() {
    const url = new URL(window.location.href);
    if (url.pathname != '/feed/subscriptions') {
        return;
    }

    Array.from(document.querySelectorAll('[overlay-style="SHORTS"]')).forEach(
        elem => {
            elem.closest('ytd-item-section-renderer, ytd-rich-item-renderer')?.remove();
        },
    );
}

function createSaveTimeButton() {
    const iconButton = document.createElement('yt-icon-button');
    iconButton.id = 'guide-button';
    iconButton.className = 'style-scope ytd-masthead';
    iconButton.addEventListener('click', saveTime);

    const icon = document.createElement('yt-icon');
    icon.id = 'guide-icon';
    icon.className = 'style-scope ytd-masthead';
    icon.setAttribute('icon', 'yt-icons:clock');

    iconButton.appendChild(icon);

    const tooltip = document.createElement('tp-yt-paper-tooltip');
    tooltip.setAttribute('position', 'right');
    tooltip.setAttribute('offset', '0');
    tooltip.style.width = 'max-content';
    tooltip.textContent = 'Save Time';

    iconButton.appendChild(tooltip);

    return iconButton;
}

function addButton() {
    let container = document.querySelector<HTMLDivElement>('#save-time-button-container');
    if (container !== null) return;

    container = document.createElement('div');
    container.id = 'save-time-button-container';
    container.style.position = 'fixed';
    container.style.left = '5px';
    container.style.bottom = '5px';
    container.style.borderRadius = '50%';
    container.style.backgroundColor = 'var(--yt-spec-additive-background)';
    container.style.zIndex = '100000';

    container.appendChild(createSaveTimeButton());

    document.body.appendChild(container);
}
