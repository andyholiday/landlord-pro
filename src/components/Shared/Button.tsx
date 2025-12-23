import { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import './Shared.css'

interface ButtonProps {
    children: ReactNode
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
    size?: 'sm' | 'md' | 'lg'
    disabled?: boolean
    loading?: boolean
    onClick?: () => void
    type?: 'button' | 'submit' | 'reset'
    icon?: string
    className?: string
}

export function Button({
    children,
    variant = 'primary',
    size = 'md',
    disabled = false,
    loading = false,
    onClick,
    type = 'button',
    icon,
    className = ''
}: ButtonProps) {
    const sizeClass = size !== 'md' ? `btn--${size}` : ''

    return (
        <button
            type={type}
            className={`btn btn--${variant} ${sizeClass} ${className}`}
            disabled={disabled || loading}
            onClick={onClick}
        >
            {loading ? (
                <span className="loading__spinner" style={{ width: 16, height: 16 }} />
            ) : icon ? (
                <span>{icon}</span>
            ) : null}
            {children}
        </button>
    )
}

interface LinkButtonProps {
    children: ReactNode
    to: string
    variant?: 'primary' | 'secondary' | 'ghost'
    size?: 'sm' | 'md' | 'lg'
    icon?: string
}

export function LinkButton({ children, to, variant = 'primary', size = 'md', icon }: LinkButtonProps) {
    const sizeClass = size !== 'md' ? `btn--${size}` : ''

    return (
        <Link to={to} className={`btn btn--${variant} ${sizeClass}`}>
            {icon && <span>{icon}</span>}
            {children}
        </Link>
    )
}

interface IconButtonProps {
    icon: string
    onClick: () => void
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
    title?: string
    disabled?: boolean
}

export function IconButton({ icon, onClick, variant = 'ghost', title, disabled }: IconButtonProps) {
    return (
        <button
            className={`btn btn--${variant} btn--icon`}
            onClick={onClick}
            title={title}
            disabled={disabled}
        >
            {icon}
        </button>
    )
}

export default Button
