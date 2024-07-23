import { useContext } from "react"
import { AppContext } from "../../state/Provider"
import { AppContextProps, Song } from "../../types"
import { PlayIcon } from "lucide-react"
import LargeRoundButton from "../shared/LargeRoundButton"
import SongListItem from "../shared/SongListItem"


const ArtistView = () => {

    const { view , setCurrentlyPlaying , setQueue } = useContext<AppContextProps>(AppContext)

    const handleClick = (song: Song) => {

        setCurrentlyPlaying(song)

        setQueue(view.data.songs)
    }

    const handlePlayArtist = () => {

        setCurrentlyPlaying(view.data.songs[0])

        setQueue(view.data.songs)
    }

    const handleScroll = (e: any) => {

        
        if(e.target.scrollTop > 30){

        }
    }

    return (
        <div className='fixed top-0 left-0 size-full bg-[var(--app-base-color)] font-pixel'>
            <div className="size-full">
                {view.data.songs[0].cover &&
                    <img src={view.data.songs[0].cover} alt="" className="size-full object-cover"/>
                }
            </div>
            <div className="absolute size-full top-0 left-0 gradient-wider flex justify-end flex-col">
                <div className="w-full py-2 px-8 flex gap-8 items-center">

                    <LargeRoundButton title="Play" onClick={handlePlayArtist}>
                        <PlayIcon />
                    </LargeRoundButton>

                    <h1 className="font-pixel text-5xl">{view.data.name}</h1>


                    <small>{view.data.songs.length} SONGS</small>
                </div>
                <section onScroll={handleScroll} className={`h-1/2 w-full overflow-scroll py-2 px-8 transition-all`}>
                    {view.data.songs.map((song: Song , i: number) => (
                        <SongListItem key={i} index={i} song={song} onClick={handleClick}/>
                    ))}
                </section>
            </div>
        </div>
    )
}

export default ArtistView