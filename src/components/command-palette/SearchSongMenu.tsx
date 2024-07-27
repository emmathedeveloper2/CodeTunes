import { useEffect, useRef, useState } from 'react'
import { APPVIEWS, Song } from '../../types'
import useAppState from '../../hooks/useAppState'

type SearchSongsMenuProp = {
    search: string
}

function SearchSongsMenu({ search }: SearchSongsMenuProp) {

    const { setCommandPaletteOpen , view , setView , currentlyPlaying , setCurrentlyPlaying , allSongs } = useAppState()

    const [highlightIndex, setHighlightIndex] = useState(0)

    const highlightIndexRef = useRef(highlightIndex)

    const currentlyHighlightedEl = useRef<any>()

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

        if (key.char === 'ArrowDown'){
            setHighlightIndex(p => p >= songs.length - 1 ? 0 : p + 1)
        }

        if (key.char === 'ArrowUp'){
            setHighlightIndex(p => p == 0 ? songs.length - 1 : p - 1)
        } 

        if (key.char === 'Enter') {

            const foundSong = songs[highlightIndexRef.current]

            playSong(foundSong)
        }
    }

    const playSong = (song?: Song) => {

        if(song){
            if(view.id === APPVIEWS.NOW_PLAYING){

                song.path != currentlyPlaying?.path ? setCurrentlyPlaying(song) : setView({ id: APPVIEWS.NOW_PLAYING });

            } else {
                setView({ id: APPVIEWS.NOW_PLAYING , data: song })
            }
        }

        setCommandPaletteOpen(false)
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
        console.log(currentlyHighlightedEl);
    }, [highlightIndex])

    useEffect(runSearch, [search])

    useEffect(onKey , [key])

    return (
        <ul className='flex-1 overflow-auto font-geist-medium p-2 gap-2'>
            {songs.map((song, i) => (
                <li onClick={() => playSong(song)} key={i} className={`w-full flex items-center gap-4 p-2 rounded ${highlightIndex == i ? 'highlighted' : ''} font-pixel mb-2 hover:bg-[var(--app-secondary-color)]`}>
                    <div className='size-[40px] bg-[var(--app-base-color)] overflow-hidden rounded-md'>
                        {song.cover &&
                            <img src={song.cover} alt={song.title} className='size-full object-cover' />
                        }
                    </div>
                    <b>{song.title}</b>
                </li>
            ))}
        </ul>
    )
}

export default SearchSongsMenu