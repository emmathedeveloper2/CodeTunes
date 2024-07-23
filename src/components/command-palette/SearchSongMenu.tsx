import { useContext, useEffect, useRef, useState } from 'react'
import { AppContext } from '../../state/Provider'
import { APPVIEWS, AppContextProps, Song } from '../../types'

type SearchSongsMenuProp = {
    search: string
}

function SearchSongsMenu({ search }: SearchSongsMenuProp) {

    const { setCommandPaletteOpen , view , setView , currentlyPlaying , setCurrentlyPlaying , allSongs } = useContext<AppContextProps>(AppContext)

    const [highlightIndex, setHighlightIndex] = useState(0)

    const highlightIndexRef = useRef(highlightIndex)

    const [songs, setSongs] = useState<Song[]>([])

    const [key, setKey] = useState({ code: '' , char: '' })


    const runSearch = () => {
        if (!search.trim()) {
            setSongs(allSongs)
        } else {
            const filtered = allSongs.filter(song => song.title.toLowerCase().includes(search.toLowerCase().slice(1)))

            setSongs(filtered)
        }


        setHighlightIndex(0)
    }

    const onKey = () => {

        if (key.char === 'ArrowDown') setHighlightIndex(p => p >= songs.length - 1 ? 0 : p + 1)

        if (key.char === 'ArrowUp') setHighlightIndex(p => p == 0 ? songs.length - 1 : p - 1)

        if (key.char === 'Enter') {

            const foundSong = songs[highlightIndexRef.current]

            if(foundSong){
                if(view.id === APPVIEWS.NOW_PLAYING){

                    foundSong.path != currentlyPlaying?.path ? setCurrentlyPlaying(foundSong) : setView({ id: APPVIEWS.NOW_PLAYING });

                } else {
                    setView({ id: APPVIEWS.NOW_PLAYING , data: foundSong })
                }
            }

            setCommandPaletteOpen(false)
        }
    }

    const handleKeyDown = (e: any) => {
        setKey({ code: (Math.random() * 10).toString() , char: e.key })
    }


    useEffect(() => {

        document.body.addEventListener('keydown', handleKeyDown)

        return () => document.body.removeEventListener('keydown', handleKeyDown)
    }, [])

    useEffect(() => {
        highlightIndexRef.current = highlightIndex
    }, [highlightIndex])

    useEffect(runSearch, [search])

    useEffect(onKey , [key])

    return (
        <div className='flex-1 overflow-scroll font-geist-medium p-2'>
            {songs.map((song, i) => (
                <div key={i} className={`w-full flex items-center gap-4 p-2 rounded ${highlightIndex == i ? 'highlighted' : ''} font-pixel`}>
                    <div className='size-[40px] bg-[var(--app-base-color)] overflow-hidden rounded-md'>
                        {song.cover &&
                            <img src={song.cover || ''} alt={song.title} className='size-full object-cover' />
                        }
                    </div>
                    <b>{song.title}</b>
                </div>
            ))}
        </div>
    )
}

export default SearchSongsMenu