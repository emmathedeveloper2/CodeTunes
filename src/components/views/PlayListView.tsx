import { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../state/Provider'
import { APPVIEWS, Album, AppContextProps, Song } from '../../types'
import { Edit2Icon, PlayIcon, PlusIcon } from 'lucide-react'
import EditPlayList from '../playlist/EditPlayList';
import { playListsStore } from '../../db';
import LargeRoundButton from '../shared/LargeRoundButton';
import SongListItem from '../shared/SongListItem';
import EditPlayListSongs from '../playlist/EditPlayListSongs';
import { AnimatePresence, motion } from 'framer-motion';
import Pluralize from '../shared/Pluralize';

function PlayListView() {

    const { view, setCurrentlyPlaying, setQueue, allSongs, allPlayLists, setAllPlayLists , showToast } = useContext<AppContextProps>(AppContext)

    const [playList, setPlayList] = useState<Album>()

    const [songs, setSongs] = useState<Song[]>([])

    const [editingPlayList, setEditingPlayList] = useState(false)

    const [editingPlayListSongs, setEditingPlayListSongs] = useState(false)

    const loadPlayList = async () => {

        const found = allPlayLists.find(p => p._id === view.data)

        setPlayList(found)

        setSongs(allSongs.filter(s => found?.songs.includes(s._id as any)))
    }

    const handleSubmit = async ({ name, image }: { name: string, image: string | null | undefined }) => {

        setEditingPlayList(false)

        if (!playList || !playList._id) return

        await playListsStore.updateOne(playList._id, data => ({ ...data, name, cover: image }))

        if (playList) setPlayList({ ...playList, name, cover: image })

        setAllPlayLists(prev => {

            const found = prev.find(p => p._id === playList._id)

            if (found) {
                found.name = name,
                found.cover = image
            }

            return prev
        })
    }

    const handleClick = (song?: Song) => {

        if (!song) return

        if (songs.length) setQueue(songs)

        setCurrentlyPlaying(song)
    }

    const addSongsToPlayList = async (songIds: number[]) => {

        const selected = songIds.reduce((prevSelected , currentId) => {

            const foundSong = allSongs.find(s => s._id === currentId)

            if(foundSong) prevSelected.push(foundSong)

            return prevSelected
        } , [] as Song[])

        if(playList) setPlayList({...playList , songs: songIds })

        setSongs(selected)

        setAllPlayLists(prev => {

            const found = prev.find(p => p._id === playList?._id)

            if (found) found.songs = songIds

            return prev
        })

        await playListsStore.updateOne(playList?._id as any , data => ({...data , songs: songIds }))

        setEditingPlayListSongs(false)

        showToast({ message: `Playlist "${playList?.name}" updated` , type: 'success' , shown: true })
    }

    const handleKeyDown = (e: KeyboardEvent) => {

        if(e.key.toLowerCase() == 'escape'){
            setEditingPlayList(false)
        }
    }

    useEffect(() => {
        loadPlayList()
    }, [allPlayLists])

    useEffect(() => {
        document.body.addEventListener('keydown' , handleKeyDown)

        return () => document.body.addEventListener('keydown' , handleKeyDown)
    } , [])

    useEffect(() => {
        if (view.id === APPVIEWS.PLAYLIST && view.data !== playList?._id) loadPlayList()
    }, [view])

    return (
        <>
            {playList &&
                <div className='fixed top-0 left-0 size-full bg-[var(--app-base-color)] font-pixel'>
                    <div className="size-full">
                        {playList.cover &&
                            <img src={playList.cover} alt="" className="size-full object-cover" />
                        }
                    </div>

                    <AnimatePresence>
                        {!editingPlayListSongs &&
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute size-full top-0 left-0 gradient-wider flex justify-end flex-col">

                                <div className="w-full py-2 px-8 flex gap-8 items-center">

                                    {songs.length > 0 &&
                                        <LargeRoundButton title='Play' onClick={() => handleClick(songs[0])}>
                                            <PlayIcon />
                                        </LargeRoundButton>
                                    }

                                    <LargeRoundButton
                                        title='Add Song'
                                        onClick={() => setEditingPlayListSongs(true)}
                                    >
                                        <PlusIcon />
                                    </LargeRoundButton>

                                    <LargeRoundButton
                                        title='Edit Playlist'
                                        onClick={() => setEditingPlayList(true)}
                                    >
                                        <Edit2Icon />
                                    </LargeRoundButton>


                                    <h1 className="title-text">{playList.name}</h1>


                                    <small>
                                        <Pluralize suffix={`${songs.length} SONG$`} count={songs.length}/>
                                    </small>
                                </div>

                                <section className={`h-1/2 w-full overflow-y-auto py-2 px-8 transition-all`}>
                                    {songs.map((song: Song, i: number) => (
                                        <SongListItem key={i} index={i} song={song} onClick={handleClick} />
                                    ))}
                                </section>
                            </motion.div>
                        }
                    </AnimatePresence>

                    {editingPlayListSongs && 
                        <EditPlayListSongs 
                            initial={songs.map(s => s._id) as number[]} 
                            onDone={addSongsToPlayList} 
                            onCancel={() => setEditingPlayListSongs(false)}
                        />
                    }
                </div>
            }

            {editingPlayList && playList && (
                <EditPlayList onSubmit={handleSubmit} playList={playList} />
            )}
        </>
    )
}

export default PlayListView
