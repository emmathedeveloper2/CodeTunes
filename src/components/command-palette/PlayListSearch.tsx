import { useContext, useEffect, useRef, useState } from 'react'
import { AppContext } from '../../state/Provider'
import { APPVIEWS, AppContextProps, PlayList } from '../../types'
import favouritesImg from '../../assets/images/favourites-background.png'

type PlayListSearchProp = {
    search: string
}

function PlayListSearch({ search }: PlayListSearchProp) {

    const { setCommandPaletteOpen, setView, allPlayLists } = useContext<AppContextProps>(AppContext)

    const [highlightIndex, setHighlightIndex] = useState(0)

    const highlightIndexRef = useRef(highlightIndex)

    const [playLists, setPlayLists] = useState<PlayList[]>([])

    const [key, setKey] = useState({ code: '', char: '' })


    const runSearch = () => {
        if (!search.trim()) {
            setPlayLists(allPlayLists)
        } else {
            const filtered = allPlayLists.filter(playList => playList.name.toLowerCase().includes(search.toLowerCase().slice(1)))

            setPlayLists(filtered)
        }


        setHighlightIndex(0)
    }

    const onKey = () => {

        if (key.char === 'ArrowDown') setHighlightIndex(p => p >= playLists.length ? 0 : p + 1)

        if (key.char === 'ArrowUp') setHighlightIndex(p => p == 0 ? playLists.length : p - 1)

        if (key.char === 'Enter') {

            if(highlightIndexRef.current === 0){

                setView({ id: APPVIEWS.FAVOURITES })
            }else{

                const foundPlayList = playLists[highlightIndexRef.current - 1]
    
                if (foundPlayList) setView({ id: APPVIEWS.PLAYLIST, data: foundPlayList._id })
            }

            setCommandPaletteOpen(false)
        }
    }

    const handleKeyDown = (e: any) => {
        setKey({ code: (Math.random() * 10).toString(), char: e.key })
    }


    useEffect(() => {

        document.body.addEventListener('keydown', handleKeyDown)

        return () => document.body.removeEventListener('keydown', handleKeyDown)
    }, [])

    useEffect(() => {
        highlightIndexRef.current = highlightIndex
    }, [highlightIndex])

    useEffect(runSearch, [search])

    useEffect(onKey, [key])

    return (
        <div className='flex-1 overflow-scroll font-geist-medium p-2'>

            <div className={`w-full flex items-center gap-4 p-2 rounded ${highlightIndex == 0 ? 'highlighted' : ''} font-pixel`}>
                <div className='size-[40px] overflow-hidden rounded-md bg-[var(--app-secondary-color)]'>
                    <img src={favouritesImg} alt="" className='size-full object-cover' />
                </div>
                <b>FAVOURITES</b>
            </div>

            {playLists.map((playlist, i) => (
                <div key={i} className={`w-full flex items-center gap-4 p-2 rounded ${highlightIndex == i + 1 ? 'highlighted' : ''} font-pixel`}>
                    <div className='size-[40px] overflow-hidden rounded-md bg-[var(--app-secondary-color)]'>
                        {playlist.cover &&
                            <img src={playlist.cover || ''} alt={playlist.name} className='size-full object-cover' />
                        }
                    </div>
                    <b>{playlist.name}</b>
                </div>
            ))}
        </div>
    )
}

export default PlayListSearch