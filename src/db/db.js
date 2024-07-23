import Nex from './nex.js'

export const CURRENT_CODETUNES_DB_VERSION = 1

export const codetunesDB = new Nex({
    name: 'codetunes', version: CURRENT_CODETUNES_DB_VERSION, migrators: {
        1: ({ createStore, }) => {
            createStore('songs')
            createStore('playlists')
        }
    }
})

