let currentInstance;
function onMounted(callback) {
    currentInstance.mountedHooks.push(callback);
}

export { currentInstance, onMounted };
