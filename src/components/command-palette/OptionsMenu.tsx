import { HomeIcon, ListMusicIcon, LucideListPlus, Music2Icon, PlayIcon } from 'lucide-react'
import { useContext, useEffect, useRef, useState } from 'react'
import { AppContext } from '../../state/Provider'
import { APPVIEWS, AppContextProps } from '../../types'

type OptionsMenuProp = {
    search: string
}

function OptionsMenu({ search }: OptionsMenuProp) {

    const { setCommandPaletteOpen , createNewPlaylist , setView , allSongs , setCurrentlyPlaying , setQueue } = useContext<AppContextProps>(AppContext)

    const initialOptions = [
        {
            name: 'Home',
            icon: HomeIcon,
            callback: () => setView({ id: APPVIEWS.BLANK })
        },
        {
            name: 'New Playlist',
            icon: LucideListPlus,
            callback: createNewPlaylist
        },
        {
            name: 'Add songs',
            icon: Music2Icon,
            callback: () => setView({ id: APPVIEWS.SCANNING_FOLDER })
        },
        {
            name: 'Now Playing',
            icon: PlayIcon,
            callback: () => setView({ id: APPVIEWS.NOW_PLAYING })
        },
        {
            name: 'Play All',
            icon: ListMusicIcon,
            callback: () => {

                if(allSongs.length < 1) return
                
                setQueue(allSongs)

                setCurrentlyPlaying(allSongs[0])

                setView({ id: APPVIEWS.NOW_PLAYING })
            }
        },
        // {
        //     name: 'Theme',
        //     icon: PaletteIcon,
        //     callback: () => setView({ id: APPVIEWS.NOW_PLAYING })
        // },
    ]

    const [highlightIndex, setHighlightIndex] = useState(0)

    const highlightIndexRef = useRef(highlightIndex)

    const [options, setOptions] = useState(initialOptions)


    const runSearch = () => {
        if(!search.trim()){
            setOptions(initialOptions)
        }else{
            const filtered = initialOptions.filter(option => option.name.toLowerCase().includes(search.toLowerCase()))
    
            setOptions(filtered)
        }


        setHighlightIndex(0)
    }

    const handleKeyDown = (e: any) => {

        if (e.key === 'ArrowDown') setHighlightIndex(p => p >= options.length - 1 ? 0 : p + 1)

        if (e.key === 'ArrowUp') setHighlightIndex(p => p == 0 ? options.length - 1 : p - 1)

        if (e.key === 'Enter') {

            const foundOption = options[highlightIndexRef.current]

            foundOption?.callback?.()

            setCommandPaletteOpen(false)
        }
    }


    useEffect(() => {
        document.body.addEventListener('keydown', handleKeyDown)

        return () => document.body.removeEventListener('keydown', handleKeyDown)
    }, [])

    useEffect(() => {
        highlightIndexRef.current = highlightIndex
    }, [highlightIndex])

    useEffect(runSearch, [search])

    return (
        <div className='flex-1 overflow-scroll font-geist-medium p-2'>
            {options.map((option, i) => (
                <div key={i} className={`w-full flex items-center gap-4 p-2 rounded ${highlightIndex == i ? 'highlighted' : ''}`}>
                    <option.icon />
                    <p>{option.name}</p>
                </div>
            ))}
        </div>
    )
}

export default OptionsMenu