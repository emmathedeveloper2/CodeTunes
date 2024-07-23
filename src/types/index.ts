import { Dispatch, MutableRefObject, SetStateAction } from "react"

export type AppContextProps = {
    view: AppViewData,
    setView: Dispatch<SetStateAction<AppViewData>>,
    commandPaletteOpen: boolean,
    setCommandPaletteOpen: Dispatch<SetStateAction<boolean>>,
    createNewPlaylist: () => void,
    allSongs: Song[],
    setAllSongs: Dispatch<SetStateAction<Song[]>>,
    allArtists: Artist[],
    setAllArtists: Dispatch<SetStateAction<Artist[]>>,
    allPlayLists: PlayList[],
    setAllPlayLists: Dispatch<SetStateAction<PlayList[]>>,
    allAlbums: Album[],
    setAllAlbums: Dispatch<SetStateAction<Album[]>>,
    playSong: (song: Song) => void,
    currentlyPlaying: Song | null,
    setCurrentlyPlaying: Dispatch<SetStateAction<Song | null>>,
    songToToggleInPlayList: Song | undefined,
    setSongToToggleInPlayList: Dispatch<SetStateAction<Song | undefined>>,
    favouriteSongs: number[],
    setFavouriteSongs: Dispatch<SetStateAction<number[]>>,
    toggleFavourites: (songId?: number) => void,
    player: MutableRefObject<HTMLAudioElement>,
    queue: Song[],
    setQueue: Dispatch<SetStateAction<Song[]>>,
    nextSong: () => void,
    previousSong: () => void,
    getNextSong: () => Song | undefined
    toast: ToastProps,
    setToast: Dispatch<SetStateAction<ToastProps>>,
    showToast: (options: ToastProps) => void
}

export type ToastType = 'success' | 'warning' | 'error' | 'info' | 'loading' | 'none'

export type ToastProps = {
    message: string
    type: ToastType
    shown: boolean
}

export type Song = {
    _id?: number,
    album: string,
    title: string,
    artist: string,
    artists: string[],
    cover: string | null,
    path: string,
    year: number,
}

export type Artist = {
    _id: number,
    name: string,
    songs: Song[],
}

export type PlayList = {
    _id?: number,
    name: string,
    songs: number[],
    cover: string | null | undefined
}

export type Album = PlayList

export enum APPVIEWS {
    BLANK = "BLANK",
    PLAYLIST = "PLAYLIST",
    FAVOURITES = "FAVOURITES",
    SCANNING_FOLDER = "SCANNING_FOLDER",
    NOW_PLAYING = "NOW_PLAYING",
    ARTIST = "ARTIST",
    ALBUM = "ALBUM",
}

export type SearchTypes = 'songs' | 'artists' | 'playlists' | 'albums' | 'options'

export type AppViewData = {
    id: APPVIEWS,
    data?: any
}