import { useEffect } from "react"


export const useKeyboardEvents = () => {

    const eventsMap: Map<string , () => void> = new Map()

    function handleKeyDown(e: KeyboardEvent){

        const { ctrlKey , shiftKey , key } = e

        const loweredKey = key.toLowerCase()

        if((ctrlKey || shiftKey) && loweredKey == 'p'){
            e.preventDefault()
        }

        if(ctrlKey && loweredKey == 'k') eventsMap.get('command-palette')?.()

        if(loweredKey == 'escape') eventsMap.get('escape')?.()
    }

    const onOpenCommandPalette = (callback: () => void) => {

        eventsMap.set('command-palette' , callback)
    }

    const onEscape = (callback: () => void) => {

        eventsMap.set('escape' , callback)
    }

    useEffect(() => {
        document.body.addEventListener('keydown' , handleKeyDown)

        return () => document.body.removeEventListener('keydown' , handleKeyDown)
    } , [])

    return { onOpenCommandPalette , onEscape }
}