import type { VideoContext } from './types';

import { PlayerWrapper } from './player-wrapper';

function isValidContext(context: Partial<VideoContext>): context is VideoContext {
    return context.playerWrapper !== undefined;
}

export class VideoContextManager {
    private static readonly _ContextCache = new WeakMap<HTMLVideoElement, Partial<VideoContext>>();

    public static getContext(video: HTMLVideoElement): VideoContext | null {
        let context = VideoContextManager._ContextCache.get(video);
        if (!context) {
            context = {};
            const playerWrapper = PlayerWrapper.Create(video);
            if (playerWrapper) {
                context.playerWrapper = playerWrapper;
            }
            VideoContextManager._ContextCache.set(video, context);
        }

        if (!isValidContext(context)) {
            return null;
        }
        return context;
    }
}
