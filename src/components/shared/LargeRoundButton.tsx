type TitlePosition = 'top' | 'right' | 'left' | 'bottom'

type LargeRoundButtonProps = {
    children?: JSX.Element | JSX.Element[]
    title?: string
    onClick?: () => void
    color?: string
    backgroundColor?: string,
    className?: string,
    position?: TitlePosition
}

const LargeRoundButton = ({ children , title , className , onClick , position = 'top' }: LargeRoundButtonProps) => {

    const getPosition = (pos: TitlePosition) => {
        if(pos === 'top') return { top: 0 , left: '50%' , transform: 'translate(-50% , -120%)' }

        if(pos === 'bottom') return { bottom: 0 , left: '50%' , transform: 'translate(-50% , 120%)' }

        if(pos === 'left') return { top: '50%' , left: 0 , transform: 'translate(-120% , -50%)' }

        if(pos === 'right') return { top: '50%' , right: 0 , transform: 'translate(120% , -50%)' }
    }

    return (
        <button onClick={onClick} className={`big-round-button relative group bg-[var(--app-primary-color)] text-[var(--app-on-primary-color)] ${className}`}>
            {children}
            <span style={getPosition(position)} className="absolute bg-inherit pointer-events-none opacity-0 group-hover:opacity-70 transition-opacity px-4 rounded whitespace-nowrap">{title}</span>
        </button>
    )
}

export default LargeRoundButton