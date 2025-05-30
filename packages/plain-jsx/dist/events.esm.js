class LifecycleEvents {
    mountedHandlers = [[]];
    readyHandlers = [[]];
    renderedHandlers = [[]];
    isListening = false;
    level = 0;
    listen(node) {
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
    async mounted() {
        for (const handlers of this.mountedHandlers.reverse()) {
            await Promise.all(handlers.map((handler) => handler()));
        }
        setTimeout(async () => {
            for (const handlers of this.readyHandlers.reverse()) {
                await Promise.all(handlers.map((handler) => handler()));
            }
        }, 0);
        requestAnimationFrame(() => {
            // can potentially handle onRender (before render) here!
            void Promise.resolve().then(async () => {
                for (const handlers of this.renderedHandlers.reverse()) {
                    await Promise.all(handlers.map((handler) => handler()));
                }
            });
        });
    }
    pushLevel() {
        this.level += 1;
        this.mountedHandlers[this.level] = this.mountedHandlers?.[this.level] ?? [];
        this.readyHandlers[this.level] = this.readyHandlers?.[this.level] ?? [];
        this.renderedHandlers[this.level] = this.renderedHandlers?.[this.level] ?? [];
    }
    popLevel() {
        this.level -= 1;
    }
    onMounted(handler) {
        this.mountedHandlers[this.level].push(handler);
    }
    onReady(handler) {
        this.readyHandlers[this.level].push(handler);
    }
    onRendered(handler) {
        this.renderedHandlers[this.level].push(handler);
    }
}

export { LifecycleEvents };
