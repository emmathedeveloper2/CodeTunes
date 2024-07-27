import { createContext, useEffect, useRef, useState } from "react";
import { APPVIEWS, Album, AppContextProps, AppViewData, Artist, ModalProps, PlayList, Song, ToastProps } from "../types";
import { playListsStore, songsStore } from '../db/index'
import { convertFileSrc } from "@tauri-apps/api/tauri";
import { exists } from "@tauri-apps/api/fs";
import { dialog } from "@tauri-apps/api";
import { processSong } from "../helpers";

const AppContext = createContext<AppContextProps | any>({})

type AppProviderProps = {
    children?: JSX.Element
}

const AppProvider = ({ children }: AppProviderProps) => {

    const [view, setView] = useState<AppViewData>({ id: APPVIEWS.BLANK })

    const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)

    const [allSongs, setAllSongs] = useState<Song[]>([])

    const [allArtists, setAllArtists] = useState<Artist[]>([])

    const [allPlayLists, setAllPlayLists] = useState<PlayList[]>([])

    const [allAlbums, setAllAlbums] = useState<Album[]>([])

    const [currentlyPlaying, setCurrentlyPlaying] = useState<Song | null>(null)

    const [songToToggleInPlayList, setSongToToggleInPlayList] = useState<Song>()

    const [ loop , setLoop ] = useState(false)

    const [favouriteSongs, setFavouriteSongs] = useState<number[]>(JSON.parse(localStorage.getItem('favourites') || '[]'))

    const [queue, setQueue] = useState<Song[]>([])

    const player = useRef(new Audio())

    const currentlyPlayingRef = useRef<Song | null>()

    const [toast, setToast] = useState<ToastProps>()

    const [modal, setModal] = useState<ModalProps>()

    const toastTimer = useRef<number>()

    const showToast = (options: ToastProps) => {

        clearTimeout(toastTimer.current)

        setToast(options)

        toastTimer.current = setTimeout(() => setToast(undefined), 2500)
    }

    const closeModal = () => {
        setModal({ open: false , title: '' , description: '' , buttons: [] })
    }

    const createNewPlaylist = async () => {

        let newPlaylist: PlayList = { name: '#untitled', songs: [], cover: null }

        const playListId = await playListsStore.addOne(newPlaylist)

        setAllPlayLists(prev => ([...prev, { _id: playListId, ...newPlaylist }]))

        setView({ id: APPVIEWS.PLAYLIST, data: playListId })
    }

    const initializeApp = async () => {

        const songs = await songsStore.getAll()

        const playLists = await playListsStore.getAll()

        setAllPlayLists(playLists)

        setAllSongs(songs)
    }

    const updateArtistsAndAlbums = () => {

        const artists: Artist[] = []

        const albums: Album[] = []

        allSongs.forEach(song => {

            const foundArtist = artists.find(artist => song.artist.toLowerCase() == artist.name.toLowerCase())

            if (foundArtist) foundArtist.songs.push(song); else artists.push({ _id: Math.floor(Math.random() * 100000), name: song.artist, songs: [song] })

            const foundAlbum = albums.find(album => song.album.toLowerCase() == album.name.toLowerCase())

            if (foundAlbum) foundAlbum.songs.push(song._id as number); else albums.push({ _id: Math.floor(Math.random() * 100000), name: song.album, cover: null, songs: [song._id as number] })
        })

        albums.forEach(album => {
            album.cover = allSongs.find(song => album.songs.includes(song._id as any) && song.cover)?.cover
        })

        setAllArtists(artists)

        setAllAlbums(albums)
    }

    const playSong = async (song: Song) => {

        const src = convertFileSrc(song.path)

        player.current.src = src

        player.current.play()
    }

    const handleCurrentlyPlaying = async () => {

        if (!currentlyPlaying){
            return
        }else if(currentlyPlaying && !await exists(currentlyPlaying.path)){

            setModal({
                open: true,
                title: 'Song not found!',
                description: "You might have moved this song to a different location or deleted it entirely",
                buttons: [
                    { 
                        text: 'Select new location' , 
                        onClick: async () => {
                            try {
                                await reSelectSong(currentlyPlaying)

                                closeModal()
                            } catch (error) {
                                console.log(error)
                            }
                        }
                    },
                    { 
                        text: 'Remove song' , 
                        onClick: () => { deleteSong(currentlyPlaying); closeModal() } 
                    }
                ]
            })

            return
        }

        playSong(currentlyPlaying)

        currentlyPlayingRef.current = currentlyPlaying

        document.title = currentlyPlaying.title
    }

    const reSelectSong = async (oldSong: Song) => {

        const newSongPath = await dialog.open({ title: 'Pick a song to replace the existing one' , filters: [ { name: 'Songs' , extensions: [ 'mp3' ] } ] })

        if(!newSongPath || !(typeof newSongPath === 'string')) throw Error('Invalid Path')

        const foundSong = await processSong(newSongPath)

        const id = await songsStore.updateOne(oldSong._id as number , data => ({...data , ...foundSong}))

        const newSong = {
            ...foundSong,
            _id: id, 
        }

        setAllSongs(prevSongs => [...prevSongs.filter(s => s._id != oldSong._id) , newSong])

        if(currentlyPlaying?._id === oldSong._id) setCurrentlyPlaying(newSong)
    }

    const deleteSong = async (song: Song) => {

        await songsStore.deleteOne(song._id as number)

        if(currentlyPlaying?._id === song._id && queue.length && queue.find(s => s._id === currentlyPlaying?._id)) nextSong()

        if(currentlyPlaying?._id === song._id) setCurrentlyPlaying(null)

        if(view.id === APPVIEWS.NOW_PLAYING) setView({ id: APPVIEWS.BLANK })

        setAllSongs(prevSongs => prevSongs.filter(s => s._id !== song._id))

        showToast({ message: 'Song removed' , type: 'info' , shown: true })
    }

    const getNextSong = () => {

        const nextSongIndex = queue.findIndex(s => s.path == currentlyPlayingRef.current?.path) + 1

        const nextSong = queue[nextSongIndex]

        return nextSong
    }

    const previousSong = () => {

        const previousSongIndex = queue.findIndex(s => s.path == currentlyPlayingRef.current?.path) - 1

        const previousSong = queue[previousSongIndex]

        if (previousSong) setCurrentlyPlaying(previousSong)
    }

    const nextSong = () => {

        const nextSongIndex = queue.findIndex(s => s.path == currentlyPlayingRef.current?.path) + 1

        const nextSong = queue[nextSongIndex]

        if (nextSong) setCurrentlyPlaying(nextSong)
    }

    const toggleFavourites = (songId?: number) => {

        if (!songId) return

        setFavouriteSongs(prev => prev.includes(songId) ? prev.filter(s => s != songId) : [songId, ...prev])

        if (favouriteSongs.includes(songId)) {
            showToast({ message: 'Removed from favourites', type: 'info', shown: true })
        } else {
            showToast({ message: 'Added to favourites', type: 'success', shown: true })
        }
    }

    useEffect(() => {
        initializeApp()
    }, [])

    useEffect(() => {
        updateArtistsAndAlbums()
    }, [allSongs])

    useEffect(() => {
        if (!queue.length) return

        player.current.removeEventListener('ended', nextSong)
        player.current.addEventListener('ended', nextSong)
    }, [queue])

    useEffect(() => {
        localStorage.setItem('favourites', JSON.stringify(favouriteSongs))
    }, [favouriteSongs])

    useEffect(() => {
        handleCurrentlyPlaying()
    }, [currentlyPlaying])

    useEffect(() => {
        player.current.loop = loop
    } , [loop])

    return (
        <AppContext.Provider value={{
            view,
            setView,
            commandPaletteOpen,
            setCommandPaletteOpen,
            createNewPlaylist,
            allSongs,
            setAllSongs,
            allArtists,
            setAllArtists,
            allPlayLists,
            setAllPlayLists,
            allAlbums,
            setAllAlbums,
            playSong,
            currentlyPlaying,
            setCurrentlyPlaying,
            songToToggleInPlayList,
            setSongToToggleInPlayList,
            player,
            queue,
            setQueue,
            nextSong,
            previousSong,
            getNextSong,
            favouriteSongs,
            setFavouriteSongs,
            loop,
            setLoop,
            toggleFavourites,
            toast,
            setToast,
            showToast,
            modal,
            setModal,
            closeModal
        }}>
            {children}
        </AppContext.Provider>
    )
}

export { AppContext, AppProvider }