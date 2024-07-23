import { ChangeEvent, FormEvent, useEffect, useState } from 'react'
import { PlayList } from '../../types'
import { Image } from 'lucide-react'

type EditPlayListProps = {
    playList: PlayList,
    onSubmit?: (data: { name: string , image: string | undefined | null }) => void
}

const EditPlayList = ({ playList , onSubmit } : EditPlayListProps) => {

    const [ imgSrc , setImgSrc ] = useState<string|null|undefined>(null)

    const handleEditImageChange = (e: ChangeEvent<HTMLInputElement>) => {

        const file = (e.target.files as any)[0]

        if(!file) return setImgSrc(undefined)

        const reader = new FileReader()

        reader.onload = e => {
            setImgSrc(e.target?.result as any)
        }

        reader.readAsDataURL(file)
    }

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {

        e.preventDefault()

        const { name } = Object.fromEntries(new FormData(e.currentTarget)) as { name: string , picture: File }

        onSubmit?.({ name , image: imgSrc })
    }

    useEffect(() => {
        setImgSrc(playList.cover);
    } , [])

    return (
        <section className='fixed top-0 left-0 size-full grid place-items-center'>

            <form onSubmit={handleSubmit} className='flex flex-col items-center p-4 gap-2 rounded shadow-lg bg-[var(--app-base-color)] w-max'>

                <label htmlFor='file' className="size-[250px] bg-[var(--app-secondary-color)] rounded-md relative z-0 grid place-items-center overflow-hidden">
                    {imgSrc && <img src={imgSrc} alt='cover' className='size-full object-cover' />}
                    <div className='size-[50px] bg-[var(--app-base-color)] grid place-items-center rounded-full -z-[1] cursor-pointer absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'>
                        <Image />
                    </div>
                </label>

                <input onChange={handleEditImageChange} id="file" type="file" name="picture" accept='.png,.jpeg,.jpg' className='hidden' />

                <input required name="name" autoComplete='off' defaultValue={playList.name} placeholder='Name' type="text" className='bg-[var(--app-secondary-color)] p-2 rounded outline-none w-full' />

                <button className='bg-[var(--app-primary-color)] text-[var(--app-on-primary-color)] w-full p-2 rounded shadow font-geist-medium'>Save</button>
            </form>

        </section>
    )
}

export default EditPlayList
