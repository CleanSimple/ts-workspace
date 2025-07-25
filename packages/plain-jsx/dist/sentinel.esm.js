class Sentinel {
    static Instance = new Sentinel();
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    constructor() { }
}
const _Sentinel = Sentinel.Instance;

export { Sentinel, _Sentinel };
