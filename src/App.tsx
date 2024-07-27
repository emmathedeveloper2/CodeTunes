import { useEffect } from "react"
import CommandPalette from "./components/command-palette/CommandPalette"
import { useKeyboardEvents } from "./hooks/KeyboardEvents"
import { APPVIEWS } from "./types"
import PlayListView from "./components/views/PlayListView"
import ScanningFolderView from "./components/views/ScanningFolderView"
import NowPlayingView from "./components/views/NowPlayingView"
import ArtistView from "./components/views/ArtistView"
import Nav from "./components/shared/Nav"
import AlbumView from "./components/views/AlbumView"
import ToggleInPlaylist from "./components/now-playing/ToggleInPlaylist"
import FavouritesView from "./components/views/FavouritesView"
import Toast from "./components/shared/Toast"
import useAppState from "./hooks/useAppState"
import Modal from "./components/shared/Modal"

function App() {

  const { onOpenCommandPalette , onEscape , onOpenView } = useKeyboardEvents()

  const { view , setView , commandPaletteOpen , setCommandPaletteOpen , songToToggleInPlayList , toast , modal } = useAppState()

  onOpenCommandPalette(() => setCommandPaletteOpen(true))

  onEscape(() => {
    setCommandPaletteOpen(false)
  })

  onOpenView(() => {
    setView({ id: APPVIEWS.NOW_PLAYING })
  })

  useEffect(() => {
    
    if(import.meta.env.PROD) document.addEventListener('contextmenu' , e => e.preventDefault())
  } , [])

  return (
    <>
      <Nav />
      <div className='size-full flex items-center justify-around flex-col gap-4'>
        <h1 className="text-5xl font-pixel cursor-pointer">CodeTunes</h1>
        <p className="font-geist-light flex items-center gap-2">
          <span className="bg-[var(--app-secondary-color)] text-[var(--app-on-secondary-color)] rounded px-2">COMMAND</span> 
          or
          <span className="bg-[var(--app-secondary-color)] text-[var(--app-on-secondary-color)] rounded px-2">CTRL</span> 
          + 
          <span className="bg-[var(--app-secondary-color)] text-[var(--app-on-secondary-color)] rounded px-2">P</span> 
        </p>
      </div>

      {view.id === APPVIEWS.PLAYLIST && <PlayListView /> }

      {view.id === APPVIEWS.SCANNING_FOLDER && <ScanningFolderView /> }

      {view.id === APPVIEWS.NOW_PLAYING && <NowPlayingView /> }

      {view.id === APPVIEWS.ARTIST && <ArtistView /> }

      {view.id === APPVIEWS.ALBUM && <AlbumView /> }

      {view.id === APPVIEWS.FAVOURITES && <FavouritesView /> }

      {commandPaletteOpen && <CommandPalette />}

      {songToToggleInPlayList && <ToggleInPlaylist song={songToToggleInPlayList}/>}

      {toast?.shown && <Toast toast={toast}/>}

      {modal?.open && <Modal data={modal}/>}
    </>
  )
}

export default App