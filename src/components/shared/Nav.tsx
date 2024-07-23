import { motion } from 'framer-motion'
import { SquareIcon, MinusIcon, X } from 'lucide-react'
import { useContext, useEffect, useState } from 'react'
import { AppContext } from '../../state/Provider'
import { AppContextProps } from '../../types'
import { appWindow } from '@tauri-apps/api/window'

const Nav = () => {

    const { view } = useContext<AppContextProps>(AppContext)

    const [visible, setVisible] = useState(false)

    const handleMouseMove = (e: MouseEvent) => {
        if (e.pageY < 30) setVisible(true); else setVisible(false)
    }

    useEffect(() => {
        document.body.addEventListener('mousemove', handleMouseMove)

        return () => document.body.removeEventListener('mousemove', handleMouseMove)
    }, [])

    return (
        <motion.div data-tauri-drag-region className={`bg-[var(--app-base-color)] w-full fixed top-0 left-0 flex items-center justify-end gap-2 text-white z-10 main-nav ${view.id}`} initial={{ opacity: 0 }} animate={{ opacity: visible ? 1 : 0 }}>
            <div onClick={() => appWindow.minimize()} className='size-[40px] grid place-items-center hover:bg-[var(--highlight)] hover:text-[var(--on-highlight)]'>
                <MinusIcon size={15} />
            </div>
            <div onClick={() => appWindow.toggleMaximize()} className='size-[40px] grid place-items-center hover:bg-[var(--highlight)] hover:text-[var(--on-highlight)]'>
                <SquareIcon size={15} />
            </div>
            <div onClick={() => appWindow.close()} className='size-[40px] grid place-items-center hover:bg-red-500'>
                <X size={15} />
            </div>
        </motion.div>
    )
}

export default Nav
