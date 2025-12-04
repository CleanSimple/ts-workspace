# @cleansimple/plain-signals

A simple signal implementation.

## Usage

```ts
import { val } from '@cleansimple/plain-signals';

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

### Signal\<T>

The base type for a signal

```ts
export interface Signal<T> {
    get value(): T;
    subscribe(observer: Observer<T>): Subscription;
}
```

Any signal will have a `value` property and a `subscribe` method.

- `value` is the current value of the signal.
- `subscribe` is used to subscribe to value changes. Observers don't receive updates immediately. Updates are batched in the next tick.

---

### `val` function

The `val` function is used to create a new signal of type `Val<T>`.

```ts
export interface Val<T> extends Signal<T> {
    set value(newValue: T);
}
```

`Val` is a simple `Signal<T>` implementation which allows mutating the value directly.

---

### `computed` function

Creates a computed signal that derives its value from one or more source signals.

```ts
import { computed, val } from '@cleansimple/plain-signals';

// single source
const count = val(0);
const double = computed(count, count => count * 2);

count.value = 5;

console.log(double.value); // 10

// multiple sources
const num1 = val(0);
const num2 = val(0);
const sum = computed([num1, num2], (num1, num2) => num1 + num2);

num1.value = 5;
num2.value = 10;

console.log(sum.value); // 15
```

### `subscribe` function

Allows subscribing to multiple signals.

```ts
import { subscribe, val } from '@cleansimple/plain-signals';

const num1 = val(0);
const num2 = val(0);

const subscription = subscribe([num1, num2], (num1, num2) => {
    console.log(num1 + num2); // 15
});

val1.value = 5;
num2.value = 10;

console.log(sum.value); // 15
```
