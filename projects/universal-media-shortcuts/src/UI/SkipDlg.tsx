import { type FunctionalComponent, ref, val } from '@cleansimple/plain-jsx';
import type { Action } from '@cleansimple/utils-js';
import { UpDown } from './UpDown';

export interface SkipDlg {
    cancel: () => void;
    accept: () => void;
}

interface SkipDlgProps {
    skipMins?: number;
    skipSecs?: number;
    onAccept?: (skipMins: number, skipSecs: number) => void;
    onClosed?: Action;
}

export const SkipDlg: FunctionalComponent<SkipDlgProps, SkipDlg> = (
    { skipMins: initialSkipMins = 0, skipSecs: initialSkipSecs = 30, onAccept, onClosed },
    { defineRef },
) => {
    const container = ref<HTMLDivElement>();
    const skipMins = val(initialSkipMins);
    const skipSecs = val(initialSkipSecs);

    function close() {
        container.value?.remove();
        onClosed?.();
    }

    function handleCancel() {
        close();
    }

    function handleOk() {
        onAccept?.(skipMins.value, skipSecs.value);
        close();
    }

    defineRef({ cancel: handleCancel, accept: handleOk });

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
                        <UpDown value={skipMins} maxValue={59} style={{ marginLeft: '5px' }} />
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
