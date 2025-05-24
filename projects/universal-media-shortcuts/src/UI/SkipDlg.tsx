import { createRef, onMounted } from '@lib/plain-jsx';
import type { Action } from '@lib/utils';
import type { HotkeyRule } from '../types';
import { UpDown } from './UpDown';

interface SkipDlgProps {
    targetVideo: HTMLVideoElement;
    enterRule: HotkeyRule;
    escRule: HotkeyRule;
    onClosed: Action;
}

export function SkipDlg(
    { targetVideo, enterRule, escRule, onClosed }: SkipDlgProps,
) {
    const container = createRef<HTMLElement>();

    const wasPlaying = !targetVideo.paused;
    let skipMins = GM_getValue('MinsValue', 1) as number;
    let skipSecs = GM_getValue('SecsValue', 0) as number;

    function close() {
        container.current?.remove();
        if (wasPlaying) {
            void targetVideo.play();
        }
        onClosed();
    }

    function show() {
        targetVideo.pause();

        if (!container.current) throw new Error();
        container.current.style.opacity = '1';
    }

    function handleCancel() {
        close();
    }

    function handleOk() {
        GM_setValue('MinsValue', skipMins);
        GM_setValue('SecsValue', skipSecs);

        targetVideo.currentTime += (skipMins * 60) + skipSecs;
        close();
    }

    enterRule.handler = handleOk;
    escRule.handler = handleCancel;

    onMounted(show);

    return (
        <div
            ref={container}
            className='skip-dlg-container'
            style={{ opacity: 1 }}
        >
            <div className='backdrop'></div>
            <div className='skip-dlg'>
                <div className='title'>
                    <label>Skip</label>
                </div>
                <div className='body'>
                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'baseline' }}>
                        <label>Mins:</label>
                        <UpDown
                            value={skipMins}
                            onValueChanged={(mins) => skipMins = mins}
                            style={{ marginLeft: '5px' }}
                        />

                        <label style={{ marginLeft: '5px' }}>Secs:</label>
                        <div
                            className='select-container'
                            style={{ marginLeft: '5px', alignSelf: 'stretch' }}
                        >
                            <select onChange={(e) => skipSecs = parseInt(e.currentTarget.value)}>
                                {[0, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map(
                                    (secs) => (
                                        <option selected={secs == skipSecs} value={secs.toString()}>
                                            {secs.toString().padStart(2, '0')}
                                        </option>
                                    ),
                                )}
                            </select>
                        </div>
                    </div>
                    <div className='actions-container' style={{ marginTop: '5px' }}>
                        <button onClick={handleCancel}>Cancel</button>
                        <button
                            style={{ marginRight: '5px' }}
                            onClick={handleOk}
                        >
                            Ok
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
