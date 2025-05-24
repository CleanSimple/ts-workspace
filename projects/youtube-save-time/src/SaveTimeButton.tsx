interface SaveTimeButtonProps {
    onClick: () => void;
}

export function SaveTimeButton({ onClick }: SaveTimeButtonProps) {
    return (
        <yt-icon-button
            id='guide-button'
            className='style-scope ytd-masthead'
            onClick={onClick}
        >
            <yt-icon id='guide-icon' className='style-scope ytd-masthead' icon='yt-icons:clock' />
            <tp-yt-paper-tooltip position='right' offset={0} style={{ width: 'max-content' }}>
                Save Time
            </tp-yt-paper-tooltip>
        </yt-icon-button>
    );
}
