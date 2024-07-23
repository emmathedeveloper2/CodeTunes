import { HistoryIcon, ScanSearch } from 'lucide-react'

const Menu = () => {

    return (
        <>
            <ul className='flex flex-col gap-4'>
                <li className="cursor-pointer flex items-center underline gap-2 font-geist-medium">
                    <ScanSearch />
                    <p>Pick songs</p>
                </li>
                <li className="cursor-pointer flex items-center underline gap-2 font-geist-medium">
                    <HistoryIcon />
                    <p>Recent songs</p>
                </li>
            </ul>
        </>
    )
}

export default Menu