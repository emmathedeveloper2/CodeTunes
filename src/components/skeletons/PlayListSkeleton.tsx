import { motion } from "framer-motion"

const PlayListSkeleton = () => {
  return (
    <motion.div initial={{ translateY: '50px' }} animate={{ translateY: 0 }} className='size-full fixed top-0 left-0 bg-[var(--app-base-color)]'>
      <div className="size-full pulse animate-pulse flex flex-col">
        <section className='w-full p-4 flex items-center gap-4 h-[270px]'>
            <div className="size-[250px] bg-[var(--app-secondary-color)] rounded-md">

            </div>
            <div className="h-full flex flex-1 flex-col justify-around">
                <div className="bg-[var(--app-secondary-color)] h-[30px] w-1/2 rounded"></div>

                <div className="flex items-center gap-1 w-full">
                    <div className="bg-[var(--app-secondary-color)] h-[30px] flex-1 rounded"></div>
                    <div className="bg-[var(--app-secondary-color)] h-[30px] flex-1 rounded"></div>
                    <div className="bg-[var(--app-secondary-color)] h-[30px] flex-1 rounded"></div>
                    <div className="bg-[var(--app-secondary-color)] h-[30px] flex-1 rounded"></div>
                </div>
            </div>
        </section>
        <div className="flex-1 overflow-scroll">

        </div>
      </div>
    </motion.div>
  )
}

export default PlayListSkeleton
