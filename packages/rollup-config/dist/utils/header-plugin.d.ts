import type { Plugin } from 'rollup';
interface PluginOptions {
    path: string;
}
export declare function header(options: PluginOptions): Plugin;
export {};
