import { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../state/Provider'
import { APPVIEWS, Album, AppContextProps, Song } from '../../types'
import { PlayIcon } from 'lucide-react'
import LargeRoundButton from '../shared/LargeRoundButton';
import SongListItem from '../shared/SongListItem';
import Pluralize from '../shared/Pluralize';

function AlbumView() {

    const { view, setCurrentlyPlaying, setQueue, allSongs, allAlbums } = useContext<AppContextProps>(AppContext)

    const [album, setAlbum] = useState<Album>()

    const [songs, setSongs] = useState<Song[]>([])

    const loadAlbum = async () => {

        const album = allAlbums.find(a => a._id === view.data)

        setAlbum(album)

        setSongs(allSongs.filter(s => album?.songs.includes(s._id as any)))
    }

    const handleClick = (song: Song) => {

        setCurrentlyPlaying(song)

        if (songs.length) setQueue(songs)
    }

    useEffect(() => {
        loadAlbum()
    }, [])

    useEffect(() => {
        if (view.id === APPVIEWS.ALBUM && view.data !== album?._id) loadAlbum()
    }, [view])

    return (
        <>

            {album &&
                <div className='fixed top-0 left-0 size-full bg-[var(--app-base-color)] font-pixel'>
                    <div className="size-full">
                        {album.cover &&
                            <img src={album.cover || ''} alt="" className="size-full object-cover" />
                        }
                    </div>
                    <div className="absolute size-full top-0 left-0 gradient-wider flex justify-end flex-col">
                        <div className="w-full py-2 px-8 flex gap-8 items-center">

                            <LargeRoundButton title='play' onClick={() => handleClick(songs[0])}>
                                <PlayIcon />
                            </LargeRoundButton>

                            <h1 className="font-pixel text-5xl">{album.name}</h1>


                            <Pluralize suffix={`${songs.length} SONG$`} count={songs.length}/>
                        </div>
                        <section className={`h-1/2 w-full overflow-scroll py-2 px-8 transition-all`}>
                            {songs.map((song: Song, i: number) => (
                                <SongListItem key={i} index={i} song={song} onClick={handleClick}/>
                            ))}
                        </section>
                    </div>
                </div>
            }
        </>
    )
}

export default AlbumView
