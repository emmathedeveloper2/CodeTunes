import { dialog } from '@tauri-apps/api'
import { readDir } from '@tauri-apps/api/fs'
import { useContext, useEffect, useState } from 'react'
import { APPVIEWS, AppContextProps, Song } from '../../types'
import { AppContext } from '../../state/Provider'
import { dealWithUnknowns, getMusicMetadata, songAlreadyExists } from '../../helpers'
import { songsStore } from '../../db'

const ScanningFolderView = () => {

  const { setView , allSongs , setAllSongs , showToast } = useContext<AppContextProps>(AppContext)

  const [ loading , setLoading ] = useState(true)

  const [ message , setMessage ] = useState('PLEASE WAIT')

  const [ foundSongs , setFoundSongs ] = useState<Song[]>([])

  //Scans a folder for all its mp3 files
  const runScan = async () => {

    const songs = await dialog.open({ multiple: true, filters: [ { name: 'Pick Songs' , extensions: ['mp3'] } ] })

    if(songs && Array.isArray(songs)){

        setMessage('SCANNING FOLDER')

        const extractedSongs = (await Promise.all(songs.map(s => getMusicMetadata(s)))).map(song => dealWithUnknowns(song))

        setFoundSongs(extractedSongs as any)

        setLoading(false)
    }else{
        setView({ id: APPVIEWS.BLANK })
    }
  }

  //Saves the songs to indexedDB and updates the lists of songs
  const saveSongs = async () => {

    const uniqueSongs = foundSongs.filter(song => !songAlreadyExists(allSongs , song))

    setLoading(true)

    if(uniqueSongs.length){
        setMessage(`SAVING ${uniqueSongs.length} SONG${uniqueSongs.length === 1 ? '' : 'S'}`)
    
        const ids = await songsStore.addMany(uniqueSongs)
    
        const retrieved = (await Promise.all(ids.map(id => songsStore.getOne(id)))) as Song[]
    
        setAllSongs(p => ([...retrieved , ...p]))
    
        showToast({ message: 'Songs saved successfully' , type: 'success' , shown: true })
    }

    await new Promise(res => setTimeout(res , 1000))

    setView({ id: APPVIEWS.BLANK })
  }

  useEffect(() => {
    runScan()
  } , [])

  return (
    <>
        {loading && <>
            <div className='size-full fixed top-0 left-0 bg-[var(--app-base-color)] grid place-items-center'>
                <h1 className='text-5xl font-pixel'>{ message }</h1>
            </div>
        </>
        }
        {!loading && <>
            <section className='size-full fixed top-0 left-0 bg-[var(--app-base-color)] overflow-scroll font-geist-medium p-4'>
                {foundSongs.map((song , i) => (
                    <div key={i} className='w-full flex items-center gap-4 mb-2 cursor-pointer'>
                        <div className='size-[50px] bg-[var(--app-secondary-color)] rounded-md overflow-hidden'>
                            {song.cover && 
                                <img src={song.cover} alt={song.title} className='size-full object-cover'/>
                            }
                        </div>
                        <div className='flex flex-col gap-2'>
                            <b className='font-geist-black'>{song.title}</b>
                            <small>{song.artist}</small>
                        </div>

                        {songAlreadyExists(allSongs , song) &&
                            <small className='bg-[var(--app-primary-color)] text-[var(--app-on-primary-color)] rounded px-4'>SAVED</small>
                        }
                    </div>
                ))}   
            </section>

            <div onClick={saveSongs} className='z-10 fixed w-[300px] bottom-4 right-4 shadow-md flex flex-col gap-2'>
                <button className='w-full rounded p-2 bg-[var(--app-primary-color)] text-[var(--app-on-primary-color)] font-geist-medium'>Save</button> 
                <button onClick={() => setView({ id: APPVIEWS.BLANK })} className='w-full rounded p-2 bg-[var(--app-secondary-color)] text-[var(--app-on-secondary-color)] font-geist-medium'>Cancel</button> 
            </div>
        </>
        }
    </>
  )
}

export default ScanningFolderView