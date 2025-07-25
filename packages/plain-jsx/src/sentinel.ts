export class Sentinel {
    public static readonly Instance = new Sentinel();
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    private constructor() {}
}

export const _Sentinel = Sentinel.Instance;
