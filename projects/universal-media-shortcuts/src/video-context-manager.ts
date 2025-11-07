import type { VideoContext } from './types';

import { PlayerWrapper } from './player-wrapper';

export class VideoContextManager {
    private static readonly _ContextCache = new WeakMap<HTMLVideoElement, VideoContext>();

    public static getContext(event: Event, video: HTMLVideoElement): VideoContext | null {
        const cachedContext = VideoContextManager._ContextCache.get(video);
        if (cachedContext?.playerWrapper.isEventSource(event)) {
            return cachedContext;
        }

        const playerWrapper = PlayerWrapper.Create(video);
        if (playerWrapper === null) {
            return null;
        }
        if (!playerWrapper.isEventSource(event)) {
            return null;
        }

        const context = { playerWrapper };
        VideoContextManager._ContextCache.set(video, context);

        return context;
    }
}
