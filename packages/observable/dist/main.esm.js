import { Computed, MultiObservableSubscription } from './helpers.esm.js';
import { ObservableImpl } from './observable.esm.js';
import { ValImpl } from './val.esm.js';

function val(initialValue) {
    return new ValImpl(initialValue);
}
function computed(observables, compute) {
    return new Computed(observables, compute);
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
    return value instanceof ObservableImpl;
}
function isVal(value) {
    return value instanceof ValImpl;
}

export { computed, isObservable, isVal, subscribe, task, val };
