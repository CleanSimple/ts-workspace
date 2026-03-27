const RefValue = Symbol('RefValue');
class RefImpl {
    [RefValue] = null;
    get current() {
        return this[RefValue];
    }
}
function ref() {
    return new RefImpl();
}

export { RefImpl, RefValue, ref };
