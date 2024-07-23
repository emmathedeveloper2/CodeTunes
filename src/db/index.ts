import { PlayList, Song } from '../types/index.js'
import { codetunesDB } from './db.js'

export const songsStore = codetunesDB.store<Song>('songs')

export const playListsStore = codetunesDB.store<PlayList>('playlists')