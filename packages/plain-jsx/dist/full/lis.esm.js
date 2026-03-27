function getLIS(arr) {
    const n = arr.length;
    const predecessors = new Int32Array(n);
    const tails = [];
    for (let i = 0; i < n; ++i) {
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

export { getLIS };
