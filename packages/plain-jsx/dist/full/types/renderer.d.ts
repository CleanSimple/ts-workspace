import { JSXNode, Action } from './types.js';

declare function render(root: Element, jsxNode: JSXNode): {
    dispose: Action;
};

export { render };
