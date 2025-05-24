class Ref {
    _current = null;
    get current() {
        return this._current;
    }
    setCurrent(value) {
        this._current = value;
    }
}
function ref() {
    return new Ref();
}

export { Ref, ref };
