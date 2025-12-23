import './Shared.css'

interface ConfirmDialogProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    title: string
    message: string
    confirmLabel?: string
    cancelLabel?: string
    variant?: 'danger' | 'warning' | 'default'
}

export function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmLabel = 'Bestätigen',
    cancelLabel = 'Abbrechen',
    variant = 'default'
}: ConfirmDialogProps) {
    if (!isOpen) return null

    const handleConfirm = () => {
        onConfirm()
        onClose()
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" style={{ maxWidth: '400px' }} onClick={e => e.stopPropagation()}>
                <div className="modal__header">
                    <h2 className="modal__title">{title}</h2>
                    <button className="modal__close" onClick={onClose}>×</button>
                </div>
                <div className="modal__body">
                    <p style={{ color: 'var(--text-secondary)' }}>{message}</p>
                </div>
                <div className="modal__footer">
                    <button className="btn btn--secondary" onClick={onClose}>
                        {cancelLabel}
                    </button>
                    <button
                        className={`btn ${variant === 'danger' ? 'btn--danger' : 'btn--primary'}`}
                        onClick={handleConfirm}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ConfirmDialog
