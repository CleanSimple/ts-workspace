# @cleansimple/observable

A simple observable value implementation.

## Usage

```ts
import { val } from '@cleansimple/observable';

const value = val(1);

// subscribe to changes
const subscription = value.subscribe((newValue) => {
    console.log(newValue); // 2
});

value.value = 2;

// unsubscribe from changes
subscription.unsubscribe();
```

## API

### Observable\<T>

The base type for an observable

```ts
export interface Observable<T> {
    get value(): T;
    subscribe: (observer: Observer<T>) => Subscription;
    computed: <TComputed>(compute: (value: T) => TComputed) => Observable<TComputed>;
}
```

Any observable will have a `value` property and a `subscribe` method.

- `value` is the current value of the observable.
- `subscribe` is used to subscribe to changes in the observable. Observers dont receive updates immediately. Updates are patched in the next tick.

The `computed` method is used to create a new observable which is computed from the original observable.
Think of it as a `map` function for observables.

```ts
const double = value.computed((value) => value * 2);
```

---

### `val` function

The `val` function is used to create a new observable value of type `Val<T>`.

```ts
export interface Val<T> extends Observable<T> {
    set value(newValue: T);
}
```

`Val` is a simple `Observable<T>` implementation which allows setting the value directly.

---

### `subscribe` and `computed` functions

The `subscribe` abd `computed` functions are the same as `.subscribe` and `.computed` on `Observable<T>`, but they allow using multiple observables as the sources.

```ts
import { computed, subscribe, val } from '@cleansimple/observable';

const val1 = val(0);
const val2 = val(0);

const subscription = subscribe([val1, val2], (val1, val2) => {
    console.log(val1 + val2); // 15
});
const sum = computed([val1, val2], (val1, val2) => val1 + val2);

val1.value = 5;
val2.value = 10;

console.log(sum.value); // 15
```
