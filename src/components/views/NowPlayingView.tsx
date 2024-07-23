import { AnimatePresence, Reorder, motion } from 'framer-motion'
import { useContext, useEffect, useState } from 'react'
import { AppContext } from '../../state/Provider'
import { AppContextProps, Song } from '../../types'
import SongListItem from '../shared/SongListItem'
import Pluralize from '../shared/Pluralize'
import Options from '../now-playing/Options'

const NowPlayingView = () => {

    const { view, currentlyPlaying, setCurrentlyPlaying, player, nextSong, previousSong, getNextSong, queue, setQueue } = useContext<AppContextProps>(AppContext)

    const [viewingQueue, setViewingQueue] = useState(false)

    const [viewingOptions, setViewingOptions] = useState(false)

    const [duration, setDuration] = useState(0)

    const [timePlayed, setTimePlayed] = useState(0)

    const [nextInQueue, setNextInQueue] = useState<Song | undefined>(undefined)

    useEffect(() => {
        if (view.data) setCurrentlyPlaying(view.data)
    }, [])

    const handleKeyDown = (e: KeyboardEvent) => {

        if (e.key === ' ') {
            player.current.paused ? player.current.play() : player.current.pause()

            return
        }

        if (e.key.toLowerCase() === 'q') {

            setViewingQueue(p => !p)

            return
        }

        if (e.key === 'ArrowLeft' && e.ctrlKey) {

            previousSong()

            return
        }

        if (e.key === 'ArrowRight' && e.ctrlKey) {

            nextSong()

            return
        }

        if (e.key === 'ArrowRight') {
            player.current.currentTime += 10

            return
        }

        if (e.key === 'ArrowLeft') {
            player.current.currentTime -= 10

            return
        }
    }

    const handleDurationChange = (e: any) => {

        setDuration((e.target as HTMLAudioElement).duration);
    }

    const handleTimeUpdate = (e: any) => {

        const time = (e.target as HTMLAudioElement).currentTime

        if (player.current.duration - time <= player.current.duration / 10) {
            setNextInQueue(getNextSong)
        } else {
            setNextInQueue(undefined)
        }

        setTimePlayed(time)
    }

    const handleMouseMove = (e: MouseEvent) => {

        if(e.pageX > window.innerWidth - 100){
            setViewingOptions(true)
        }else{
            setViewingOptions(false)
        }
    }

    useEffect(() => {

        document.body.addEventListener('keydown', handleKeyDown)

        document.body.addEventListener('mousemove' , handleMouseMove)

        player.current.addEventListener('timeupdate', handleTimeUpdate)

        player.current.addEventListener('durationchange', handleDurationChange)

        setDuration(player.current.duration)

        return () => {
            document.body.removeEventListener('keydown', handleKeyDown)

            document.body.removeEventListener('mousemove' , handleMouseMove)

            player.current.removeEventListener('timeupdate', handleTimeUpdate)

            player.current.removeEventListener('durationchange', handleDurationChange)
        }
    }, [])

    return (
        <>
            {currentlyPlaying &&
                <motion.div initial={{ translateY: '50px' }} animate={{ translateY: 0 }} exit={{ translateY: '50px' }} className='fixed top-0 left-0 size-full z-0 bg-[var(--app-base-color)]'>
                    {currentlyPlaying.cover &&
                        <img src={currentlyPlaying.cover || ''} alt="" className='absolute size-full object-cover -z-[1]' />
                    }

                    <main style={{ transition: '.5s ease-in-out', transform: `translateY(${viewingQueue ? '-100%' : '0%'})` }} className='size-full'>
                        <div className='size-full gradient flex flex-col gap-4 justify-end p-4 font-pixel'>
                            <h1 className='text-5xl'>{currentlyPlaying.title}</h1>
                            <p>{currentlyPlaying.artist}</p>
                            <div style={{ width: ((timePlayed / duration) * 100) + '%' }} className='h-[5px] bg-[var(--app-primary-color)] w-0'>

                            </div>
                        </div>
                        <div className='size-full px-4 bg-[var(--gradient-color)] overflow-scroll pt-12'>
                            <Reorder.Group values={queue} onReorder={data => setQueue([...data])}>
                                {queue.map(song => (
                                    <Reorder.Item key={song._id} value={song}>
                                        <motion.div transition={{ delay: .2 }} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}>
                                            <SongListItem onClick={() => setCurrentlyPlaying(song)} song={song} />
                                        </motion.div>
                                    </Reorder.Item>
                                ))}
                            </Reorder.Group>
                        </div>
                    </main>

                    <AnimatePresence>
                        {nextInQueue && !viewingQueue &&
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className='font-pixel fixed top-12 left-4 bg-[#000000ad] rounded p-2 flex flex-col text-white min-w-[300px]'>
                                <p>UP NEXT</p>

                                <div className='flex items-center gap-2'>
                                    <div className='size-[40px] rounded overflow-hidden'>
                                        {nextInQueue.cover &&
                                            <img src={nextInQueue.cover as string} className='size-full object-cover' alt='' />
                                        }
                                    </div>
                                    <div className='flex flex-col'>
                                        <h1>{nextInQueue.title}</h1>
                                        <h1>{nextInQueue.artist}</h1>
                                    </div>
                                </div>
                            </motion.div>
                        }
                        {!viewingQueue && viewingOptions &&
                            <Options />
                        }
                        {viewingQueue &&
                            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className='bg-[var(--app-primary-color)] text-[var(--app-on-primary-color)] py-2 px-8 rounded font-pixel fixed bottom-4 left-1/2 -translate-x-1/2'>
                                <Pluralize suffix={`${queue.length} SONG$ IN QUEUE`} count={queue.length} />
                            </motion.p>
                        }
                    </AnimatePresence>
                </motion.div>
            }
        </>
    )
}

export default NowPlayingView