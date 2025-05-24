let currentInstance;
function setCurrentInstance(instance) {
    const prev = currentInstance;
    currentInstance = instance;
    return () => {
        currentInstance = prev;
    };
}
function onMounted(callback) {
    if (currentInstance === null) {
        throw new Error();
    }
    currentInstance.mountedHooks.push(callback);
}

export { currentInstance, onMounted, setCurrentInstance };
