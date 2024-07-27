import { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../state/Provider'
import { AppContextProps, Song } from '../../types'
import { PlayIcon } from 'lucide-react'
import LargeRoundButton from '../shared/LargeRoundButton';
import SongListItem from '../shared/SongListItem';
import { motion } from 'framer-motion';
import Pluralize from '../shared/Pluralize';
import favouritesImage from '../../assets/images/favourites-background.png'

function FavouritesView() {

    const { setCurrentlyPlaying, setQueue, allSongs, favouriteSongs } = useContext<AppContextProps>(AppContext)


    const [songs, setSongs] = useState<Song[]>([])

    const load = async () => {

        setSongs(allSongs.filter(s => favouriteSongs.includes(s._id as number)))
    }

    const handleClick = (song?: Song) => {

        if (!song) return

        if (songs.length) setQueue(songs)
        
        setCurrentlyPlaying(song)
    }

    useEffect(() => {
        load()
    }, [favouriteSongs , allSongs])

    return (
        <div className='fixed top-0 left-0 size-full bg-[var(--app-base-color)] font-pixel'>
            <div className="size-full">
                <img src={favouritesImage} alt="" className="size-full object-cover" />
            </div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute size-full top-0 left-0 gradient-wider flex justify-end flex-col">

                <div className="w-full py-2 px-8 flex gap-8 items-center">

                    {songs.length > 0 &&
                        <LargeRoundButton title='Play' onClick={() => handleClick(songs[0])}>
                            <PlayIcon />
                        </LargeRoundButton>
                    }


                    <h1 className="font-pixel text-5xl">FAVOURITES</h1>


                    <small>
                        <Pluralize suffix={`${songs.length} SONG$`} count={songs.length} />
                    </small>
                </div>

                <section className={`h-1/2 w-full overflow-y-auto py-2 px-8 transition-all`}>
                    {songs.map((song: Song, i: number) => (
                        <SongListItem key={i} index={i} song={song} onClick={handleClick} />
                    ))}
                </section>
            </motion.div>
        </div>
    )
}

export default FavouritesView