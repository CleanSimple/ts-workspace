import { ref, render } from '@cleansimple/plain-jsx';
import { PlayersSelector } from './players';
import { SkipDlg } from './UI/SkipDlg';

export class PlayerWrapper {
    public static Create(video: HTMLVideoElement): PlayerWrapper | null {
        const player = video.closest<HTMLElement>(PlayersSelector);
        if (player === null) {
            // alert('Player not supported!');
            return null;
        }
        return new PlayerWrapper(player, video);
    }

    private readonly playerElement: HTMLElement;
    private readonly videoElement: HTMLVideoElement;
    private readonly skipDlgRef = ref<typeof SkipDlg>();

    private constructor(playerElement: HTMLElement, videoElement: HTMLVideoElement) {
        this.playerElement = playerElement;
        this.videoElement = videoElement;
    }

    public get status() {
        if (this.skipDlgRef.current) {
            return 'skipping';
        }
        return this.videoElement.paused ? 'paused' : 'playing';
    }

    public isEventSource(event: Event): boolean {
        if (event.target instanceof HTMLElement) {
            return event.target === this.playerElement || event.target === this.videoElement
                || this.playerElement.contains(event.target);
        }
        return false;
    }

    public focus() {
        this.videoElement.focus();
    }

    public toggleUIVisibility() {
        this.playerElement.classList.toggle('ums-ui-hidden');
        this.videoElement.focus();
    }

    public toggleCaptionsVisibility() {
        this.playerElement.classList.toggle('ums-cc-hidden');
    }

    public toggleSkipDialog() {
        if (this.skipDlgRef.current) {
            this.skipDlgRef.current.cancel();
            return;
        }

        const wasPlaying = !this.videoElement.paused;
        const wasUiHidden = this.playerElement.classList.contains('ums-ui-hidden');
        if (wasPlaying) {
            this.videoElement.pause();
        }
        if (wasUiHidden) {
            this.toggleUIVisibility();
        }

        const skipMins = GM_getValue('MinsValue', 1);
        const skipSecs = GM_getValue('SecsValue', 0);

        const handleAccept = (skipMins: number, skipSecs: number) => {
            GM_setValue('MinsValue', skipMins);
            GM_setValue('SecsValue', skipSecs);

            this.videoElement.currentTime += (skipMins * 60) + skipSecs;
        };

        const handleClosed = () => {
            if (wasPlaying) {
                void this.videoElement.play();
            }
            if (wasUiHidden) {
                this.toggleUIVisibility();
            }
            skipDlgRender.dispose();
        };

        const skipDlgRender = render(
            document.fullscreenElement ?? this.playerElement,
            <SkipDlg
                ref={this.skipDlgRef}
                skipMins={skipMins}
                skipSecs={skipSecs}
                onAccept={handleAccept}
                onClosed={handleClosed}
            />,
        );
    }

    public skipDialogAccept() {
        this.skipDlgRef.current?.accept();
    }

    public skipForward() {
        this.videoElement.currentTime += 3;
    }

    public skipBackward() {
        this.videoElement.currentTime -= 3;
    }

    public volUp() {
        this.videoElement.volume = Math.min(1, this.videoElement.volume + 0.05);
    }

    public volDown() {
        this.videoElement.volume = Math.max(0, this.videoElement.volume - 0.05);
    }

    public togglePause() {
        if (this.videoElement.paused) {
            void this.videoElement.play();
        }
        else {
            this.videoElement.pause();
        }
    }

    public speedUp() {
        this.videoElement.playbackRate += 0.05;
    }

    public speedDown() {
        this.videoElement.playbackRate -= 0.05;
    }

    public speedReset() {
        this.videoElement.playbackRate = 1;
    }
}
