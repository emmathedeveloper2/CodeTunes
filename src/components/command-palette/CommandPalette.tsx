import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { SearchTypes } from '../../types'
import OptionsMenu from './OptionsMenu'
import SearchSongsMenu from './SearchSongMenu'
import ArtistsSearchMenu from './ArtistsSearch'
import PlayListSearch from './PlayListSearch'
import AlbumSearch from './AlbumSearch'

const CommandPalette = () => {

  const [searchQuery, setSearchQuery] = useState('')

  const [searchType, setSearchType] = useState<SearchTypes>('options')

  const handleSearch = () => {

    if (searchQuery.startsWith('@')) {
      setSearchType('artists')
    } else if (searchQuery.startsWith('>')) {
      setSearchType('songs');
    } else if (searchQuery.startsWith('#')) {
      setSearchType('playlists');
    } else if (searchQuery.startsWith(':')) {
      setSearchType('albums');
    } else setSearchType('options')
  }

  useEffect(handleSearch, [searchQuery])

  return (
    <motion.div
      // initial={{ opacity: 0 }} 
      // animate={{ opacity: 1 }}
      // exit={{ opacity: 0}}
      autoFocus={true}
      className='flex flex-col fixed z-[1000] top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 shadow-lg bg-[var(--app-base-color)] border-2 border-[var(--app-secondary-color)] rounded-md w-[90%] lg:w-[500px] h-[400px]'>
      <input
        autoFocus
        value={searchQuery}
        onInput={e => setSearchQuery(e.currentTarget.value)}
        type="text"
        placeholder='Press "Escape" to cancel. type "@" for artist, ">" for songs, "#" for playlists, ":" for albums'
        className='bg-transparent border-b border-b-[var(--app-secondary-color)] w-full p-4 outline-none'
      />

      {searchType === 'options' && <OptionsMenu search={searchQuery} />}
      {searchType === 'songs' && <SearchSongsMenu search={searchQuery} />}
      {searchType === 'artists' && <ArtistsSearchMenu search={searchQuery} />}
      {searchType === 'playlists' && <PlayListSearch search={searchQuery} />}
      {searchType === 'albums' && <AlbumSearch search={searchQuery} />}
    </motion.div>
  )
}

export default CommandPalette