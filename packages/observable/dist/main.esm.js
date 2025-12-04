import { Observable } from './abstract/Observable.esm.js';
import { Computed } from './impl/Computed.esm.js';
import { ComputedSingle } from './impl/ComputedSingle.esm.js';
import { MultiObservableSubscription } from './impl/MultiObservableSubscription.esm.js';
import { Val } from './impl/Val.esm.js';
import './extensions.esm.js';

function val(initialValue) {
    return new Val(initialValue);
}
function computed(source, compute) {
    return Array.isArray(source)
        ? source.length === 1
            ? new ComputedSingle(source[0], compute)
            : new Computed(source, compute)
        : new ComputedSingle(source, compute);
}
function subscribe(observables, observer) {
    return new MultiObservableSubscription(observables, observer);
}
const TaskAborted = Symbol('TaskAborted');
function task(action) {
    const value = val(undefined);
    const error = val(undefined);
    const status = val('Running');
    const isRunning = status.computed(status => status === 'Running');
    const isCompleted = status.computed(status => status !== 'Running');
    const isSuccess = status.computed(status => status === 'Success');
    const isError = status.computed(status => status === 'Error');
    let abortController = null;
    const run = () => {
        if (abortController) {
            abortController.abort(TaskAborted);
        }
        abortController = new AbortController();
        status.value = 'Running';
        error.value = undefined;
        action({ signal: abortController.signal }).then((result) => {
            value.value = result;
            status.value = 'Success';
        }).catch(err => {
            if (err === TaskAborted)
                return;
            error.value = err;
            status.value = 'Error';
        });
    };
    run();
    return { value, status, isRunning, isCompleted, isSuccess, isError, error, rerun: run };
}
function isObservable(value) {
    return value instanceof Observable;
}
function isVal(value) {
    return value instanceof Val;
}

export { computed, isObservable, isVal, subscribe, task, val };
