import { AnimatePresence, motion } from "framer-motion"
import { useContext, useState } from "react"
import { AppContext } from "../../state/Provider"
import { AppContextProps, Song } from "../../types"
import SongListItem from "../shared/SongListItem"
import Pluralize from "../shared/Pluralize"

type EditPlayListSongsProps = {
    initial?: number[],
    onDone?: (songsId: number[]) => void,
    onCancel?: () => void
}

const EditPlayListSongs = ({ initial, onDone , onCancel }: EditPlayListSongsProps) => {

    const { allSongs } = useContext<AppContextProps>(AppContext)

    const [searchQuery, setSearchQuery] = useState('')

    const [selectedSongsIds, setSelectedSongsIds] = useState([...(initial || [])])

    const deselectSong = (songId: number) => {
        setSelectedSongsIds(prev => prev.filter(s => s !== songId))
    }

    const selectSong = (songId: number) => {
        setSelectedSongsIds(prev => [songId , ...prev])
    }

    const currentlyInSearch = (song: Song) => {

        if(!searchQuery.trim()) return true

        return (song.artist.toLowerCase().includes(searchQuery.toLowerCase()) || song.title.toLowerCase().includes(searchQuery.toLowerCase()))
    }

    return (
        <motion.div initial={{ translateX: '100%' }} animate={{ translateX: 0 }} exit={{ translateX: '100%' }} className="fixed top-0 right-0 size-full flex items-center">

            <div className="flex-1 h-full bg-[var(--gradient-lighter-color)] px-4 pt-10">
                <div className="w-full p-4 flex items-center gap-2">
                    <button onClick={() => onDone?.(selectedSongsIds)} className='bg-[var(--app-primary-color)] text-[var(--app-on-primary-color)] w-full p-2 rounded shadow font-geist-medium'>
                        <Pluralize suffix={`Add ${selectedSongsIds.length} Song$`} count={selectedSongsIds.length}/>
                    </button>

                    <button onClick={onCancel} className='bg-[var(--app-secondary-color)] text-[var(--app-on-secondary-color)] w-full p-2 rounded shadow font-geist-medium'>
                        Cancel
                    </button>
                </div>

                <div className="overflow-scroll">
                    <AnimatePresence mode="sync">
                        {allSongs.filter(s => selectedSongsIds.includes(s._id as number)).map((song, i) => (
                            <motion.div initial={{ translateY: '-100%' , opacity: 0 }} animate={{ translateY: 0 , opacity: 1 }} exit={{ translateY: '-100%' , opacity: 0 }} key={i} className="w-full">
                                <SongListItem song={song} onClick={() => deselectSong(song._id as number)} showExtras={false}/>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>

            <div className="h-full flex-1 bg-[var(--gradient-color)] flex flex-col pt-10">
                <input
                    autoFocus
                    value={searchQuery}
                    onInput={e => setSearchQuery(e.currentTarget.value)}
                    type="text"
                    placeholder='Search Songs'
                    className='bg-transparent border-b border-b-[var(--app-secondary-color)] w-full p-4 outline-none'
                />

                <div className="flex-1 overflow-scroll">
                    <AnimatePresence mode="sync">
                        {allSongs.filter(s => !selectedSongsIds.includes(s._id as number) && currentlyInSearch(s)).map((song, i) => (
                            <motion.div initial={{ translateY: '-100%' , opacity: 0 }} animate={{ translateY: 0 , opacity: 1 }} exit={{ translateY: '-100%' , opacity: 0 }} key={i} className="w-full">
                                <SongListItem song={song} onClick={() => selectSong(song._id as number)} showExtras={false}/>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>
        </motion.div>
    )
}

export default EditPlayListSongs
