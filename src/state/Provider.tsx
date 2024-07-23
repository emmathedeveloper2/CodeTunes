import { createContext, useEffect, useRef, useState } from "react";
import { APPVIEWS, Album, AppContextProps, AppViewData, Artist, PlayList, Song, ToastProps } from "../types";
import { playListsStore, songsStore } from '../db/index'
import { convertFileSrc } from "@tauri-apps/api/tauri";
import { exists } from "@tauri-apps/api/fs";

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

    const [favouriteSongs, setFavouriteSongs] = useState<number[]>(JSON.parse(localStorage.getItem('favourites') || '[]'))

    const [queue, setQueue] = useState<Song[]>([])

    const player = useRef(new Audio())

    const currentlyPlayingRef = useRef<Song | null>()

    const [toast, setToast] = useState<ToastProps>()

    const toastTimer = useRef<number>()

    const showToast = (options: ToastProps) => {

        clearTimeout(toastTimer.current)

        setToast(options)

        toastTimer.current = setTimeout(() => setToast(undefined), 2500)
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

        if (!currentlyPlaying || !await exists(currentlyPlaying.path)) return

        playSong(currentlyPlaying)

        currentlyPlayingRef.current = currentlyPlaying

        document.title = currentlyPlaying.title
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
            toggleFavourites,
            toast,
            setToast,
            showToast
        }}>
            {children}
        </AppContext.Provider>
    )
}

export { AppContext, AppProvider }