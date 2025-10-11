const _Fragment = document.createDocumentFragment();
function patchChildren(parent, current, target) {
    const newIndexMap = new Map(target.map((node, index) => [node, index]));
    const newIndexToOldIndexMap = new Int32Array(target.length).fill(-1);
    const nodeAfterEnd = current[current.length - 1].nextSibling; // `current` should never be empty, so this is safe
    let maxNewIndexSoFar = -1;
    let moved = false;
    const toRemove = new Array();
    for (let i = 0; i < current.length; ++i) {
        const oldNode = current[i];
        const newIndex = newIndexMap.get(oldNode);
        if (newIndex === undefined) {
            toRemove.push(oldNode);
        }
        else {
            newIndexToOldIndexMap[newIndex] = i;
            if (newIndex < maxNewIndexSoFar)
                moved = true;
            else
                maxNewIndexSoFar = newIndex;
        }
    }
    // remove old nodes
    _Fragment.append(...toRemove);
    _Fragment.textContent = null;
    // compute longest increasing subsequence
    const lis = moved ? getLIS(newIndexToOldIndexMap) : [];
    const ops = [];
    let currentOp = null;
    let j = lis.length - 1;
    for (let i = target.length - 1; i >= 0; --i) {
        const newNode = target[i];
        const nextPos = target.at(i + 1) ?? nodeAfterEnd;
        if (newIndexToOldIndexMap[i] === -1) {
            if (currentOp?.type === 'insert') {
                currentOp.nodes.unshift(newNode);
            }
            else {
                currentOp = { type: 'insert', pos: nextPos, nodes: [newNode] };
                ops.push(currentOp);
            }
            continue;
        }
        else if (moved) {
            if (j < 0 || i !== lis[j]) {
                if (currentOp?.type === 'insert') {
                    currentOp.nodes.unshift(newNode);
                }
                else {
                    currentOp = { type: 'insert', pos: nextPos, nodes: [newNode] };
                    ops.push(currentOp);
                }
                continue;
            }
            j--;
        }
        currentOp = null;
    }
    for (const op of ops) {
        if (op.type === 'insert' || op.type === 'move') {
            if (op.pos) {
                _Fragment.append(...op.nodes);
                parent.insertBefore(_Fragment, op.pos);
            }
            else {
                parent.append(...op.nodes);
            }
        }
    }
}
function getLIS(arr) {
    const n = arr.length;
    const predecessors = new Int32Array(n);
    const tails = [];
    for (let i = 0; i < n; i++) {
        const num = arr[i];
        // Binary search in tails
        let lo = 0, hi = tails.length;
        while (lo < hi) {
            const mid = (lo + hi) >> 1;
            if (arr[tails[mid]] < num)
                lo = mid + 1;
            else
                hi = mid;
        }
        // lo is the position to insert
        predecessors[i] = lo > 0 ? tails[lo - 1] : -1;
        if (lo === tails.length)
            tails.push(i);
        else
            tails[lo] = i;
    }
    // Reconstruct LIS indices
    const lis = [];
    let k = tails[tails.length - 1];
    for (let i = tails.length - 1; i >= 0; --i) {
        lis[i] = k;
        k = predecessors[k];
    }
    return lis;
}

export { patchChildren };
