import { motion } from "framer-motion"
import { useContext, useEffect, useState } from 'react'
import { AppContext } from "../../state/Provider"
import { AppContextProps, Song } from "../../types"
import { playListsStore } from "../../db"

type ToggleInPlayListProps = {
  song: Song,
}

const SongBox = ({ song }: { song: Song }) => {

  return (
    <div key={song._id} className={`w-full flex items-center gap-4 p-2 rounded font-pixel cursor-pointer bg-[var(--app-base-color)]`}>
      <div className='size-[40px] overflow-hidden rounded-md bg-[var(--app-secondary-color)]'>
        {song.cover &&
          <img src={song.cover} alt={song.artist} className='size-full object-cover' />
        }
      </div>
      <div className="*:block">
        <b>{song.artist}</b>
        <small>{song.title}</small>
      </div>
    </div>
  )
}

const ToggleInPlaylist = ({ song }: ToggleInPlayListProps) => {

  const { allPlayLists, setAllPlayLists , setSongToToggleInPlayList } = useContext<AppContextProps>(AppContext)

  const [ originalList , setOriginalList ] = useState<number[]>([])

  const [selectedPlayLists, setSelectedPlayLists] = useState<number[]>([])

  const toggleSelected = (playListId: number) => {

    selectedPlayLists.includes(playListId) ? setSelectedPlayLists(prevIds => prevIds.filter(id => id != playListId)) : setSelectedPlayLists(prevIds => [...prevIds, playListId])
  }

  const handleFinish = async () => {

    const playListIds = allPlayLists.map(p => p._id) as number[]

    const removed = playListIds.filter(id => originalList.includes(id) && !selectedPlayLists.includes(id))

    const added = playListIds.filter(id => !originalList.includes(id) && selectedPlayLists.includes(id))

    setAllPlayLists(prevPlayLists => {

      prevPlayLists.forEach(playList => {

        if(added.includes(playList._id as number)){
          playList.songs = [...playList.songs , (song._id as number)];
        }

        if(removed.includes(playList._id as number)){
          playList.songs = playList.songs.filter(s => s != song._id)
        }
      })

      return [...prevPlayLists]
    })

    await Promise.all(added.map(id => playListsStore.updateOne(id , data => ({...data , songs: [...data.songs , song._id as number]}))))

    await Promise.all(removed.map(id => playListsStore.updateOne(id , data => ({...data , songs: data.songs.filter(s => s != song._id)}))))

    setSongToToggleInPlayList(undefined)
  }

  useEffect(() => {

    const filtered = allPlayLists.filter(playList => playList.songs.includes(song._id as number)).map(p => p._id as number)

    setOriginalList(filtered)

    setSelectedPlayLists(filtered)
  }, [])

  return (
    <motion.section className='fixed top-0 left-0 size-full flex items-center justify-center bg-[var(--gradient-lighter-color)]'>

      <section className="w-[400px] flex flex-col items-center justify-center gap-2">
        <SongBox song={song} />

        <div className='w-full h-[400px] bg-[var(--app-base-color)] p-4 rounded-md overflow-auto'>
          {allPlayLists.map(playList => (
            <div onClick={() => toggleSelected(playList._id as number)} key={playList._id} className={`w-full flex items-center gap-4 p-2 rounded ${selectedPlayLists.includes(playList._id as number) ? 'highlighted' : 'bg-[var(--app-secondary-color)]'} mb-4 font-pixel cursor-pointer`}>
              <div className='size-[40px] overflow-hidden rounded-md bg-[var(--app-secondary-color)]'>
                {playList.cover &&
                  <img src={playList.cover} alt={playList.name} className='size-full object-cover' />
                }
              </div>
              <b>{playList.name}</b>
            </div>
          ))}
        </div>

        <div className="w-full p-4 flex items-center gap-2 bg-[var(--app-base-color)] rounded-md">
          <button onClick={handleFinish} className='bg-[var(--app-primary-color)] text-[var(--app-on-primary-color)] w-full p-2 rounded shadow font-geist-medium'>
            Done
          </button>

          <button onClick={() => setSongToToggleInPlayList(undefined)} className='bg-[var(--app-secondary-color)] text-[var(--app-on-secondary-color)] w-full p-2 rounded shadow font-geist-medium'>
            Cancel
          </button>
        </div>
      </section>
    </motion.section>
  )
}

export default ToggleInPlaylist