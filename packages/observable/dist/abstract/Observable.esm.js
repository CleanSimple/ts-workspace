import { DeferredNotifier } from './DeferredNotifier.esm.js';

const ObservableSymbol = Symbol('Observable');
class Observable extends DeferredNotifier {
    [ObservableSymbol] = true;
}

export { Observable };
