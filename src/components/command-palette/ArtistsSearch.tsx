import { useContext, useEffect, useRef, useState } from 'react'
import { AppContext } from '../../state/Provider'
import { APPVIEWS, AppContextProps, Artist } from '../../types'

type ArtistsSearchMenuProp = {
    search: string
}

function ArtistsSearchMenu({ search }: ArtistsSearchMenuProp) {

    const { setCommandPaletteOpen , setView , allArtists } = useContext<AppContextProps>(AppContext)

    const [highlightIndex, setHighlightIndex] = useState(0)

    const highlightIndexRef = useRef(highlightIndex)

    const [artists, setArtists] = useState<Artist[]>([])

    const [key, setKey] = useState({ code: '' , char: '' })


    const runSearch = () => {
        if (!search.trim()) {
            setArtists(allArtists)
        } else {
            const filtered = allArtists.filter(artist => artist.name.toLowerCase().includes(search.toLowerCase().slice(1)))

            setArtists(filtered)
        }


        setHighlightIndex(0)
    }

    const onKey = () => {

        if (key.char === 'ArrowDown') setHighlightIndex(p => p >= artists.length - 1 ? 0 : p + 1)

        if (key.char === 'ArrowUp') setHighlightIndex(p => p == 0 ? artists.length - 1 : p - 1)

        if (key.char === 'Enter') {

            const foundArtist = artists[highlightIndexRef.current]

            if(foundArtist) setView({ id: APPVIEWS.ARTIST , data: foundArtist })

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
            {artists.map((artist, i) => (
                <div key={i} className={`w-full flex items-center gap-4 p-2 rounded ${highlightIndex == i ? 'highlighted' : ''} font-pixel`}>
                    <div className='size-[40px] overflow-hidden rounded-md bg-[var(--app-secondary-color)]'>
                        {artist.songs[0]?.cover && 
                            <img src={artist.songs[0].cover || ''} alt={artist.name} className='size-full object-cover' />
                        }
                    </div>
                    <b>{artist.name}</b>
                </div>
            ))}
        </div>
    )
}

export default ArtistsSearchMenu