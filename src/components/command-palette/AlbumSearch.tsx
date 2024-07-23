import { useContext, useEffect, useRef, useState } from 'react'
import { AppContext } from '../../state/Provider'
import { APPVIEWS, AppContextProps, PlayList } from '../../types'

type AlbumSearchProp = {
    search: string
}

function AlbumSearch({ search }: AlbumSearchProp) {

    const { setCommandPaletteOpen , setView , allAlbums } = useContext<AppContextProps>(AppContext)

    const [highlightIndex, setHighlightIndex] = useState(0)

    const highlightIndexRef = useRef(highlightIndex)

    const [albums, setAlbums] = useState<PlayList[]>([])

    const [key, setKey] = useState({ code: '' , char: '' })


    const runSearch = () => {
        if (!search.trim()) {
            setAlbums(allAlbums)
        } else {
            const filtered = allAlbums.filter(album => album.name.toLowerCase().includes(search.toLowerCase().slice(1)))

            setAlbums(filtered)
        }


        setHighlightIndex(0)
    }

    const onKey = () => {

        if (key.char === 'ArrowDown') setHighlightIndex(p => p >= albums.length - 1 ? 0 : p + 1)

        if (key.char === 'ArrowUp') setHighlightIndex(p => p == 0 ? albums.length - 1 : p - 1)

        if (key.char === 'Enter') {

            const foundAlbum = albums[highlightIndexRef.current]

            if(foundAlbum) setView({ id: APPVIEWS.ALBUM , data: foundAlbum._id })

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
            {albums.map((album, i) => (
                <div key={i} className={`w-full flex items-center gap-4 p-2 rounded ${highlightIndex == i ? 'highlighted' : ''} font-pixel`}>
                    <div className='size-[40px] overflow-hidden rounded-md bg-[var(--app-secondary-color)]'>
                        {album.cover && 
                            <img src={album.cover || ''} alt={album.name} className='size-full object-cover' />
                        }
                    </div>
                    <b>{album.name}</b>
                </div>
            ))}
        </div>
    )
}

export default AlbumSearch