import { InputHTMLAttributes, forwardRef } from 'react'
import './Shared.css'

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string
    error?: string
    hint?: string
    required?: boolean
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
    ({ label, error, hint, required, className = '', ...props }, ref) => {
        return (
            <div className="form-group">
                <label className={`form-label ${required ? 'form-label--required' : ''}`}>
                    {label}
                </label>
                <input
                    ref={ref}
                    className={`form-input ${error ? 'form-input--error' : ''} ${className}`}
                    {...props}
                />
                {error && <div className="form-error">{error}</div>}
                {hint && !error && <div className="form-hint">{hint}</div>}
            </div>
        )
    }
)

FormField.displayName = 'FormField'

interface SelectFieldProps {
    label: string
    value: string
    onChange: (value: string) => void
    options: { value: string; label: string }[]
    error?: string
    required?: boolean
    placeholder?: string
}

export function SelectField({ label, value, onChange, options, error, required, placeholder }: SelectFieldProps) {
    return (
        <div className="form-group">
            <label className={`form-label ${required ? 'form-label--required' : ''}`}>
                {label}
            </label>
            <select
                className={`form-select ${error ? 'form-input--error' : ''}`}
                value={value}
                onChange={e => onChange(e.target.value)}
            >
                {placeholder && <option value="">{placeholder}</option>}
                {options.map(opt => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
            {error && <div className="form-error">{error}</div>}
        </div>
    )
}

interface TextareaFieldProps {
    label: string
    value: string
    onChange: (value: string) => void
    error?: string
    hint?: string
    required?: boolean
    rows?: number
    placeholder?: string
}

export function TextareaField({ label, value, onChange, error, hint, required, rows = 4, placeholder }: TextareaFieldProps) {
    return (
        <div className="form-group">
            <label className={`form-label ${required ? 'form-label--required' : ''}`}>
                {label}
            </label>
            <textarea
                className={`form-textarea ${error ? 'form-input--error' : ''}`}
                value={value}
                onChange={e => onChange(e.target.value)}
                rows={rows}
                placeholder={placeholder}
            />
            {error && <div className="form-error">{error}</div>}
            {hint && !error && <div className="form-hint">{hint}</div>}
        </div>
    )
}

interface CheckboxFieldProps {
    label: string
    checked: boolean
    onChange: (checked: boolean) => void
}

export function CheckboxField({ label, checked, onChange }: CheckboxFieldProps) {
    return (
        <label className="form-checkbox">
            <input
                type="checkbox"
                checked={checked}
                onChange={e => onChange(e.target.checked)}
            />
            <span>{label}</span>
        </label>
    )
}

export default FormField
