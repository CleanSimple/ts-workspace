const RefValue = Symbol('RefValue');
function ref() {
    return new RefImpl();
}
class RefImpl {
    [RefValue] = null;
    get current() {
        return this[RefValue];
    }
}

export { RefImpl, RefValue, ref };
