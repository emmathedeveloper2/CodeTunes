import { useEffect } from "react"


export const useKeyboardEvents = () => {

    const eventsMap: Map<string , () => void> = new Map()

    function handleKeyDown(e: KeyboardEvent){

        const { ctrlKey , key } = e

        const loweredKey = key.toLowerCase()

        if(ctrlKey && loweredKey == 'p'){
            e.preventDefault()
            eventsMap.get('command-palette')?.()
        }

        if(ctrlKey && loweredKey == 'r'){
            if(import.meta.env.PROD) e.preventDefault()
        }

        if(ctrlKey && loweredKey == 'n'){
            eventsMap.get('open-view')?.()
        }

        if(loweredKey == 'escape') eventsMap.get('escape')?.()
    }

    const onOpenCommandPalette = (callback: () => void) => {

        eventsMap.set('command-palette' , callback)
    }

    const onEscape = (callback: () => void) => {

        eventsMap.set('escape' , callback)
    }

    const onOpenView = (callback: () => void) => {

        eventsMap.set('open-view' , callback)
    }

    useEffect(() => {
        document.body.addEventListener('keydown' , handleKeyDown)

        return () => document.body.removeEventListener('keydown' , handleKeyDown)
    } , [])

    return { onOpenCommandPalette , onEscape , onOpenView }
}