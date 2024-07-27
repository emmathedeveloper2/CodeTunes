import { useEffect, useRef, useState } from 'react'
import { APPVIEWS, PlayList } from '../../types'
import favouritesImg from '../../assets/images/favourites-background.png'
import useAppState from '../../hooks/useAppState'

type PlayListSearchProp = {
    search: string
}

function PlayListSearch({ search }: PlayListSearchProp) {

    const { setCommandPaletteOpen, setView, allPlayLists } = useAppState()

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

                openFavourites()
            }else{

                const foundPlayList = playLists[highlightIndexRef.current - 1]
    
                openPlayList(foundPlayList)
            }

            setCommandPaletteOpen(false)
        }
    }

    const openPlayList = (playList?: PlayList) => {
        if (playList) setView({ id: APPVIEWS.PLAYLIST, data: playList._id })

        setCommandPaletteOpen(false)
    }

    const openFavourites = () => {
        setView({ id: APPVIEWS.FAVOURITES })

        setCommandPaletteOpen(false)
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
        <div className='flex-1 overflow-auto font-geist-medium p-2'>

            <div onClick={openFavourites} className={`w-full flex items-center gap-4 p-2 rounded ${highlightIndex == 0 ? 'highlighted' : 'hover:bg-[var(--app-secondary-color)]'} font-pixel`}>
                <div className='size-[40px] overflow-hidden rounded-md bg-[var(--app-secondary-color)]'>
                    <img src={favouritesImg} alt="" className='size-full object-cover' />
                </div>
                <b>FAVOURITES</b>
            </div>

            {playLists.map((playlist, i) => (
                <div onClick={() => openPlayList(playlist)} key={i} className={`w-full flex items-center gap-4 p-2 rounded ${highlightIndex == i + 1 ? 'highlighted' : 'hover:bg-[var(--app-secondary-color)]'} font-pixel`}>
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