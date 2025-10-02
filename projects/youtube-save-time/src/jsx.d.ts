import '@cleansimple/plain-jsx';

declare module '@cleansimple/plain-jsx' {
    namespace JSX {
        interface IntrinsicElements {
            'yt-icon-button': PropsOf<HTMLElement>;
            'yt-icon': PropsOf<HTMLElement> & {
                icon?: string;
            };
            'tp-yt-paper-tooltip': PropsOf<HTMLElement> & {
                position?: 'left' | 'right' | 'top' | 'bottom';
                offset?: number;
            };
        }
    }
}
