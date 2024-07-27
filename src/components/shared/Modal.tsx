import { ModalProps } from "../../types"

const Wrapper = (
    { children }: { children?: JSX.Element | JSX.Element[] }
) => <div className="fixed size-full p-4 top-0 left-0 grid place-items-center bg-[var(--modal-wrapper-bg)]">{children}</div>

const Modal = ({ data } : { data: ModalProps }) => {

    return (
        <Wrapper>
            <div className="w-[400px] rounded shadow p-4 bg-[var(--app-base-color)] text-[var(--app-on-base-color)] font-geist-medium flex flex-col gap-4">
                <h1 className="text-2xl">{data.title}</h1>

                {data.description && <p>{data.description}</p>}

                {data.buttons.length > 0 &&
                    <div className="w-full flex items-center justify-end gap-2">
                        {data.buttons.map((b , i) => (
                            <button key={i} onClick={b.onClick} className="shadow-inner rounded-md bg-[var(--app-secondary-color)] text-[var(--app-onsecondary-color)] px-4 p-2">{b.text}</button>
                        ))}
                    </div>
                }
            </div>
        </Wrapper>
    )
}

export default Modal