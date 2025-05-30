import type { MaybePromise } from '@lib/utils';
import type { EventHandler } from './types';

export class LifecycleEvents {
    private readonly mountedHandlers: EventHandler[][] = [[]];
    private readonly readyHandlers: EventHandler[][] = [[]];
    private readonly renderedHandlers: EventHandler[][] = [[]];
    private isListening = false;
    private level = 0;

    public listen(node: Node) {
        if (this.isListening) {
            throw new Error('Invalid operation. Can only listen once.');
        }
        this.isListening = true;

        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                for (const addedNode of mutation.addedNodes) {
                    if (addedNode === node || addedNode.contains(node)) {
                        this.isListening = false;
                        observer.disconnect();
                        void this.mounted();
                        return;
                    }
                }
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }

    private async mounted() {
        for (const handlers of this.mountedHandlers.reverse()) {
            await Promise.all(handlers.map((handler): MaybePromise<void> => handler()));
        }
        setTimeout(async () => {
            for (const handlers of this.readyHandlers.reverse()) {
                await Promise.all(handlers.map((handler): MaybePromise<void> => handler()));
            }
        }, 0);
        requestAnimationFrame(() => {
            // can potentially handle onRender (before render) here!
            void Promise.resolve().then(async () => {
                for (const handlers of this.renderedHandlers.reverse()) {
                    await Promise.all(handlers.map((handler): MaybePromise<void> => handler()));
                }
            });
        });
    }

    public pushLevel() {
        this.level += 1;
        this.mountedHandlers[this.level] = this.mountedHandlers?.[this.level] ?? [];
        this.readyHandlers[this.level] = this.readyHandlers?.[this.level] ?? [];
        this.renderedHandlers[this.level] = this.renderedHandlers?.[this.level] ?? [];
    }

    public popLevel() {
        this.level -= 1;
    }

    public onMounted(handler: EventHandler) {
        this.mountedHandlers[this.level].push(handler);
    }

    public onReady(handler: EventHandler) {
        this.readyHandlers[this.level].push(handler);
    }

    public onRendered(handler: EventHandler) {
        this.renderedHandlers[this.level].push(handler);
    }
}
