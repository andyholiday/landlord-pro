import { useEffect, useState } from 'react'
import { Expense, ExpenseCategory, Property } from '../../types'
import { Button, Modal, SelectField } from '../Shared'
import { FormField } from '../Shared/FormField'
import './Expenses.css'

function ExpenseOverview() {
    const [expenses, setExpenses] = useState<Expense[]>([])
    const [categories, setCategories] = useState<ExpenseCategory[]>([])
    const [properties, setProperties] = useState<Property[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
    const [selectedPropertyId, setSelectedPropertyId] = useState<string>('')

    useEffect(() => {
        loadData()
    }, [])

    useEffect(() => {
        if (selectedPropertyId) {
            loadExpenses()
        }
    }, [selectedPropertyId, selectedYear])

    const loadData = async () => {
        try {
            const [propertiesData, categoriesData] = await Promise.all([
                window.electronAPI.properties.getAll(),
                window.electronAPI.expenses.getCategories()
            ])
            setProperties(propertiesData)
            setCategories(categoriesData)
            if (propertiesData.length > 0) {
                setSelectedPropertyId(propertiesData[0].id)
            }
        } catch (error) {
            console.error('Failed to load data:', error)
        } finally {
            setLoading(false)
        }
    }

    const loadExpenses = async () => {
        try {
            const expensesData = await window.electronAPI.expenses.getByProperty(selectedPropertyId, selectedYear)
            setExpenses(expensesData)
        } catch (error) {
            console.error('Failed to load expenses:', error)
        }
    }

    const handleExpenseCreated = (newExpense: Expense) => {
        setExpenses(prev => [...prev, newExpense])
        setShowForm(false)
    }

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('de-DE', {
            style: 'currency',
            currency: 'EUR'
        }).format(value)
    }

    const getCategoryName = (categoryId: string) => {
        return categories.find(c => c.id === categoryId)?.name || 'Unbekannt'
    }

    const groupedExpenses = expenses.reduce((groups, expense) => {
        const category = getCategoryName(expense.categoryId)
        if (!groups[category]) {
            groups[category] = []
        }
        groups[category].push(expense)
        return groups
    }, {} as Record<string, Expense[]>)

    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)

    if (loading) {
        return (
            <div className="loading">
                <div className="loading__spinner" />
            </div>
        )
    }

    return (
        <div className="page">
            <div className="page__header">
                <h1 className="page__title">Nebenkosten</h1>
                <div className="page__actions">
                    <Button icon="+" onClick={() => setShowForm(true)} disabled={properties.length === 0}>
                        Kosten erfassen
                    </Button>
                </div>
            </div>

            {properties.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state__icon">🏠</div>
                    <div className="empty-state__title">Erst Immobilie anlegen</div>
                    <div className="empty-state__description">
                        Bevor Sie Kosten erfassen können, müssen Sie mindestens eine Immobilie haben.
                    </div>
                </div>
            ) : (
                <>
                    {/* Filters */}
                    <div className="expense-filters">
                        <SelectField
                            label="Immobilie"
                            value={selectedPropertyId}
                            onChange={setSelectedPropertyId}
                            options={properties.map(p => ({ value: p.id, label: p.name }))}
                        />
                        <SelectField
                            label="Jahr"
                            value={selectedYear.toString()}
                            onChange={value => setSelectedYear(parseInt(value))}
                            options={[
                                { value: (new Date().getFullYear() - 1).toString(), label: (new Date().getFullYear() - 1).toString() },
                                { value: new Date().getFullYear().toString(), label: new Date().getFullYear().toString() },
                                { value: (new Date().getFullYear() + 1).toString(), label: (new Date().getFullYear() + 1).toString() }
                            ]}
                        />
                        <div className="expense-total">
                            <span className="expense-total__label">Gesamtkosten</span>
                            <span className="expense-total__value">{formatCurrency(totalExpenses)}</span>
                        </div>
                    </div>

                    {/* Expenses by Category */}
                    {Object.keys(groupedExpenses).length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state__icon">💰</div>
                            <div className="empty-state__title">Keine Kosten erfasst</div>
                            <div className="empty-state__description">
                                Erfassen Sie Kosten für das Jahr {selectedYear}.
                            </div>
                        </div>
                    ) : (
                        <div className="expense-categories">
                            {Object.entries(groupedExpenses).map(([category, categoryExpenses]) => {
                                const categoryTotal = categoryExpenses.reduce((sum, e) => sum + e.amount, 0)
                                return (
                                    <div key={category} className="expense-category card">
                                        <div className="expense-category__header">
                                            <h3 className="expense-category__name">{category}</h3>
                                            <span className="expense-category__total">{formatCurrency(categoryTotal)}</span>
                                        </div>
                                        <div className="expense-list">
                                            {categoryExpenses.map(expense => (
                                                <div key={expense.id} className="expense-item">
                                                    <div className="expense-item__info">
                                                        <span className="expense-item__vendor">{expense.vendor}</span>
                                                        <span className="expense-item__date">
                                                            {new Date(expense.invoiceDate).toLocaleDateString('de-DE')}
                                                        </span>
                                                    </div>
                                                    <span className="expense-item__amount">{formatCurrency(expense.amount)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </>
            )}

            {/* New Expense Form Modal */}
            {showForm && (
                <ExpenseForm
                    properties={properties}
                    categories={categories}
                    selectedPropertyId={selectedPropertyId}
                    onClose={() => setShowForm(false)}
                    onSave={handleExpenseCreated}
                />
            )}
        </div>
    )
}

interface ExpenseFormProps {
    properties: Property[]
    categories: ExpenseCategory[]
    selectedPropertyId: string
    onClose: () => void
    onSave: (expense: Expense) => void
}

function ExpenseForm({ properties, categories, selectedPropertyId, onClose, onSave }: ExpenseFormProps) {
    const [formData, setFormData] = useState({
        propertyId: selectedPropertyId,
        categoryId: categories[0]?.id || '',
        year: new Date().getFullYear(),
        amount: 0,
        invoiceNumber: '',
        invoiceDate: new Date().toISOString().split('T')[0],
        vendor: '',
        description: ''
    })
    const [saving, setSaving] = useState(false)

    const handleSubmit = async () => {
        if (!formData.propertyId || !formData.categoryId || formData.amount <= 0) return

        setSaving(true)
        try {
            const expense = await window.electronAPI.expenses.create({
                propertyId: formData.propertyId,
                categoryId: formData.categoryId,
                billingPeriod: {
                    year: formData.year,
                    startDate: `${formData.year}-01-01`,
                    endDate: `${formData.year}-12-31`
                },
                amount: formData.amount,
                invoiceNumber: formData.invoiceNumber || undefined,
                invoiceDate: formData.invoiceDate,
                vendor: formData.vendor,
                description: formData.description || undefined
            })
            onSave(expense)
        } catch (error) {
            console.error('Failed to create expense:', error)
        } finally {
            setSaving(false)
        }
    }

    return (
        <Modal
            isOpen={true}
            onClose={onClose}
            title="Kosten erfassen"
            footer={
                <>
                    <Button variant="secondary" onClick={onClose}>Abbrechen</Button>
                    <Button onClick={handleSubmit} loading={saving}>Speichern</Button>
                </>
            }
        >
            <div className="form-row form-row--2">
                <SelectField
                    label="Immobilie"
                    value={formData.propertyId}
                    onChange={value => setFormData(prev => ({ ...prev, propertyId: value }))}
                    options={properties.map(p => ({ value: p.id, label: p.name }))}
                    required
                />
                <SelectField
                    label="Kategorie"
                    value={formData.categoryId}
                    onChange={value => setFormData(prev => ({ ...prev, categoryId: value }))}
                    options={categories.map(c => ({ value: c.id, label: c.name }))}
                    required
                />
            </div>
            <div className="form-row form-row--3">
                <FormField
                    label="Betrag (€)"
                    type="number"
                    value={formData.amount}
                    onChange={e => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                    required
                />
                <FormField
                    label="Rechnungsdatum"
                    type="date"
                    value={formData.invoiceDate}
                    onChange={e => setFormData(prev => ({ ...prev, invoiceDate: e.target.value }))}
                    required
                />
                <FormField
                    label="Jahr"
                    type="number"
                    value={formData.year}
                    onChange={e => setFormData(prev => ({ ...prev, year: parseInt(e.target.value) || new Date().getFullYear() }))}
                    required
                />
            </div>
            <div className="form-row form-row--2">
                <FormField
                    label="Lieferant"
                    value={formData.vendor}
                    onChange={e => setFormData(prev => ({ ...prev, vendor: e.target.value }))}
                    placeholder="z.B. Stadtwerke"
                    required
                />
                <FormField
                    label="Rechnungsnummer"
                    value={formData.invoiceNumber}
                    onChange={e => setFormData(prev => ({ ...prev, invoiceNumber: e.target.value }))}
                />
            </div>
            <FormField
                label="Beschreibung"
                value={formData.description}
                onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Optionale Notizen..."
            />
        </Modal>
    )
}

export default ExpenseOverview
