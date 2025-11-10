const RefValue = Symbol('RefValue');
function ref() {
    return new Ref();
}
class Ref {
    [RefValue] = null;
    get current() {
        return this[RefValue];
    }
}

export { Ref, RefValue, ref };
