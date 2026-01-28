import { heh } from './utils';

declare global {
    interface Window {
        heh: typeof heh;
    }
}

(function(window) {
    window.heh = heh;
})(window);
