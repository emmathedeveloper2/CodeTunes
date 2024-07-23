import { motion } from "framer-motion"
import LargeRoundButton from '../shared/LargeRoundButton'
import { HeartIcon } from 'lucide-react'
import { useContext } from "react"
import { AppContext } from "../../state/Provider"
import { AppContextProps } from "../../types"

const Options = () => {

  const { favouriteSongs , toggleFavourites , currentlyPlaying } = useContext<AppContextProps>(AppContext)

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className='fixed right-4 top-1/2 -translate-y-1/2 flex flex-col items-center gap-4 font-pixel'>
        <LargeRoundButton onClick={() => toggleFavourites(currentlyPlaying?._id)} position='left' title={`Add to Favourites`}>
            <HeartIcon fill={`${favouriteSongs.includes(currentlyPlaying?._id as number) ? 'rgb(236 72 153)' : 'black'}`} stroke="none"/>
        </LargeRoundButton>
    </motion.div>
  )
}

export default Options
