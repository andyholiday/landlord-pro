import { ReactNode, useEffect } from 'react'
import './Shared.css'

interface ModalProps {
    isOpen: boolean
    onClose: () => void
    title: string
    children: ReactNode
    size?: 'default' | 'lg' | 'xl'
    footer?: ReactNode
}

export function Modal({ isOpen, onClose, title, children, size = 'default', footer }: ModalProps) {
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
        }

        if (isOpen) {
            document.addEventListener('keydown', handleEscape)
            document.body.style.overflow = 'hidden'
        }

        return () => {
            document.removeEventListener('keydown', handleEscape)
            document.body.style.overflow = ''
        }
    }, [isOpen, onClose])

    if (!isOpen) return null

    const sizeClass = size !== 'default' ? `modal--${size}` : ''

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className={`modal ${sizeClass}`} onClick={e => e.stopPropagation()}>
                <div className="modal__header">
                    <h2 className="modal__title">{title}</h2>
                    <button className="modal__close" onClick={onClose}>×</button>
                </div>
                <div className="modal__body">
                    {children}
                </div>
                {footer && (
                    <div className="modal__footer">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    )
}

export default Modal
