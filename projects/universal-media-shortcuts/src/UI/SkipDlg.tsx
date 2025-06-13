import { type FunctionalComponent, ref, val } from '@lib/plain-jsx';
import type { Action } from '@lib/utils';
import type { HotkeyRule } from '../types';
import { UpDown } from './UpDown';

interface SkipDlgRefType {
    close: () => void;
    show: () => void;
}

interface SkipDlgProps {
    targetVideo: HTMLVideoElement;
    enterRule: HotkeyRule;
    escRule: HotkeyRule;
    onClosed: Action;
}

export const SkipDlg: FunctionalComponent<SkipDlgProps, SkipDlgRefType> = (
    { targetVideo, enterRule, escRule, onClosed },
    { defineRef },
) => {
    const container = ref<HTMLDivElement>();
    const skipMins = val(GM_getValue('MinsValue', 1) as number);
    const skipSecs = val(GM_getValue('SecsValue', '0') as string);

    const wasPlaying = !targetVideo.paused;

    function close() {
        container.value?.remove();
        if (wasPlaying) {
            void targetVideo.play();
        }
        onClosed();
    }

    function show() {
        targetVideo.pause();

        if (!container.value) throw new Error();
        container.value.style.opacity = '1';
    }

    function handleCancel() {
        close();
    }

    function handleOk() {
        GM_setValue('MinsValue', skipMins.value);
        GM_setValue('SecsValue', skipSecs.value);

        targetVideo.currentTime += (skipMins.value * 60) + parseInt(skipSecs.value);
        close();
    }

    defineRef({ close, show });

    enterRule.handler = handleOk;
    escRule.handler = handleCancel;

    const secsOptions = [0, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map(String);
    return (
        <div
            ref={container}
            class='skip-dlg-container'
            style={{ opacity: 1 }}
        >
            <div class='backdrop'></div>
            <div class='skip-dlg'>
                <div class='title'>
                    <label>Skip</label>
                </div>
                <div class='body'>
                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'baseline' }}>
                        <label>Mins:</label>
                        <UpDown value={skipMins} style={{ marginLeft: '5px' }} />

                        <label style={{ marginLeft: '5px' }}>Secs:</label>
                        <div
                            class='select-container'
                            style={{ marginLeft: '5px', alignSelf: 'stretch' }}
                        >
                            <select value={skipSecs}>
                                {secsOptions.map((secs) => (
                                    <option selected={secs == skipSecs.value} value={secs}>
                                        {secs.padStart(2, '0')}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div class='actions-container' style={{ marginTop: '5px' }}>
                        <button on:click={handleCancel}>Cancel</button>
                        <button style={{ marginRight: '5px' }} on:click={handleOk}>
                            Ok
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
