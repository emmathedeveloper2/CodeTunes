import { HeartIcon, PlusIcon } from "lucide-react"
import { AppContextProps, Song } from "../../types"
import { useContext } from "react"
import { AppContext } from "../../state/Provider"

type SongListItemProps = {
    onClick?: (song: Song) => void,
    song: Song,
    index?: number,
    showExtras?: boolean
}

const PlayingIndicator = () => {

    return (
        <div className="absolute h-[70%] w-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-end justify-center gap-1 p-[2px]">
            <div style={{ animationDelay: '0s' }} className="bg-[var(--app-primary-color)] animate-playing h-full w-[5px]"></div>
            <div style={{ animationDelay: '.5s' }} className="bg-[var(--app-primary-color)] animate-playing h-full w-[5px]"></div>
            <div style={{ animationDelay: '.2s' }} className="bg-[var(--app-primary-color)] animate-playing h-full w-[5px]"></div>
        </div>
    )
}

const SongListItem = ({ song, onClick, index, showExtras = true }: SongListItemProps) => {

    const { setSongToToggleInPlayList, toggleFavourites, favouriteSongs , currentlyPlaying } = useContext<AppContextProps>(AppContext)

    const handleClick = (e: any) => {

        if (!e.target.closest('#actions')) {
            onClick?.(song)
        }
    }

    return (
        <div onClick={handleClick} className={`w-full flex items-center justify-between gap-4 p-2 rounded font-pixel hover:text-[var(--app-primary-color)] mb-4 relative group cursor-pointer`}>

            <section className="flex items-center gap-4">
                {index !== undefined && <p>{index + 1}</p>}
                <div className='size-[40px] overflow-hidden rounded-md bg-[var(--app-secondary-color)] relative'>
                    {song.cover &&
                        <img src={song.cover} alt={song.cover} className='size-full object-cover' />
                    }
                    {currentlyPlaying?._id == song._id && showExtras &&
                        <PlayingIndicator />
                    }
                </div>

                <div className="flex flex-col gap-2">
                    <b>{song.title}</b>
                    <small>{song.artist}</small>
                </div>
            </section>

            {showExtras &&
                <div id="actions" className="flex items-center gap-2 opacity-0 group-hover:opacity-100 *:cursor-pointer">
                    <div onClick={() => setSongToToggleInPlayList(song)}>
                        <PlusIcon />
                    </div>
                    <div onClick={() => toggleFavourites(song._id)}>
                        <HeartIcon fill={`${favouriteSongs.includes(song._id as number) ? 'rgb(236 72 153)' : 'var(--app-on-base-color)'}`}  stroke="none"/>
                    </div>
                </div>
            }
        </div>
    )
}

export default SongListItem