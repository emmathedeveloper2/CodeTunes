import { motion } from "framer-motion"
import LargeRoundButton from '../shared/LargeRoundButton'
import { HeartIcon, Repeat2Icon } from 'lucide-react'
import useAppState from "../../hooks/useAppState"

const Options = () => {

  const { favouriteSongs , toggleFavourites , currentlyPlaying , loop , setLoop , showToast } = useAppState()

  const toggleLoop = () => {

    setLoop(p => !p)

    let message = !loop ? 'Repeat on' : 'Repeat off'

    showToast({ message , shown: true , type: 'info' })
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className='fixed right-4 top-1/2 -translate-y-1/2 flex flex-col items-center gap-4 font-pixel'>
        <LargeRoundButton onClick={() => toggleFavourites(currentlyPlaying?._id)} position='left' title={`Add to Favourites`}>
            <HeartIcon fill={`${favouriteSongs.includes(currentlyPlaying?._id as number) ? 'rgb(236 72 153)' : 'black'}`} stroke="none"/>
        </LargeRoundButton>
        <LargeRoundButton onClick={() => toggleLoop()} position='left' title={`Repeat`}>
            <Repeat2Icon stroke={`${loop ? '#22c55e' : 'black'}`}/>
        </LargeRoundButton>
    </motion.div>
  )
}

export default Options
