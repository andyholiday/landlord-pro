import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Property, Tenant, Expense, ExpenseCategory, BillingStatement, BillingItem } from '../../types'
import { Button, SelectField } from '../Shared'
import { v4 as uuidv4 } from 'uuid'
import './Billing.css'

const STEPS = [
    'Immobilie',
    'Zeitraum',
    'Kosten',
    'Verteilung',
    'Berechnung',
    'Vorschau'
]

function BillingWizard() {
    const navigate = useNavigate()
    const [currentStep, setCurrentStep] = useState(0)
    const [properties, setProperties] = useState<Property[]>([])
    const [tenants, setTenants] = useState<Tenant[]>([])
    const [expenses, setExpenses] = useState<Expense[]>([])
    const [categories, setCategories] = useState<ExpenseCategory[]>([])
    const [loading, setLoading] = useState(true)

    // Form data
    const [selectedPropertyId, setSelectedPropertyId] = useState('')
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear() - 1)
    const [calculatedStatements, setCalculatedStatements] = useState<BillingStatement[]>([])

    useEffect(() => {
        loadData()
    }, [])

    useEffect(() => {
        if (selectedPropertyId && selectedYear) {
            loadPropertyData()
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

    const loadPropertyData = async () => {
        try {
            const [tenantsData, expensesData] = await Promise.all([
                window.electronAPI.tenants.getByProperty(selectedPropertyId),
                window.electronAPI.expenses.getByProperty(selectedPropertyId, selectedYear)
            ])
            setTenants(tenantsData.filter(t => t.status === 'active'))
            setExpenses(expensesData)
        } catch (error) {
            console.error('Failed to load property data:', error)
        }
    }

    const calculateBilling = () => {
        const property = properties.find(p => p.id === selectedPropertyId)
        if (!property || tenants.length === 0) return

        const statements: BillingStatement[] = tenants.map(tenant => {
            // Calculate tenant's share for each expense category
            const items: BillingItem[] = []
            const expensesByCategory = expenses.reduce((acc, expense) => {
                if (!acc[expense.categoryId]) {
                    acc[expense.categoryId] = []
                }
                acc[expense.categoryId].push(expense)
                return acc
            }, {} as Record<string, Expense[]>)

            let totalTenantShare = 0

            Object.entries(expensesByCategory).forEach(([categoryId, categoryExpenses]) => {
                const category = categories.find(c => c.id === categoryId)
                if (!category || !category.isRecoverable) return

                const totalAmount = categoryExpenses.reduce((sum, e) => sum + e.amount, 0)

                // Calculate tenant's share based on distribution key
                let tenantUnits = 1
                let totalUnits = 1

                if (property.units && property.units.length > 0) {
                    const tenantUnit = property.units.find(u => u.id === tenant.unitId)

                    switch (category.distributionKey) {
                        case 'area':
                            totalUnits = property.units.reduce((sum, u) => sum + u.area, 0)
                            tenantUnits = tenantUnit?.area || 0
                            break
                        case 'units':
                            totalUnits = property.units.length
                            tenantUnits = 1
                            break
                        case 'persons':
                            // Simplified: assume 1 person per unit
                            totalUnits = property.units.length
                            tenantUnits = 1
                            break
                        default:
                            totalUnits = property.units.length
                            tenantUnits = 1
                    }
                }

                const percentage = (tenantUnits / totalUnits) * 100
                const tenantAmount = (totalAmount * tenantUnits) / totalUnits

                items.push({
                    categoryId,
                    categoryName: category.name,
                    totalAmount,
                    distributionKey: category.distributionKey,
                    calculation: {
                        totalUnits,
                        tenantUnits,
                        percentage
                    },
                    tenantAmount
                })

                totalTenantShare += tenantAmount
            })

            const advancePayments = tenant.contract.additionalCostsAdvance * 12
            const balance = totalTenantShare - advancePayments

            const statement: BillingStatement = {
                id: uuidv4(),
                propertyId: selectedPropertyId,
                unitId: tenant.unitId,
                tenantId: tenant.id,
                billingPeriod: {
                    year: selectedYear,
                    startDate: `${selectedYear}-01-01`,
                    endDate: `${selectedYear}-12-31`
                },
                tenantPeriod: {
                    startDate: `${selectedYear}-01-01`,
                    endDate: `${selectedYear}-12-31`,
                    daysInPeriod: 365,
                    totalDaysInYear: 365
                },
                items,
                summary: {
                    totalCosts: expenses.reduce((sum, e) => sum + e.amount, 0),
                    tenantShare: totalTenantShare,
                    advancePayments,
                    balance
                },
                status: 'draft',
                createdAt: new Date().toISOString()
            }

            return statement
        })

        setCalculatedStatements(statements)
    }

    const handleNext = () => {
        if (currentStep === 3) {
            calculateBilling()
        }
        setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1))
    }

    const handleBack = () => {
        setCurrentStep(prev => Math.max(prev - 1, 0))
    }

    const handleSave = async () => {
        try {
            for (const statement of calculatedStatements) {
                await window.electronAPI.billing.save(statement)
            }
            navigate('/billing')
        } catch (error) {
            console.error('Failed to save billing statements:', error)
        }
    }

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('de-DE', {
            style: 'currency',
            currency: 'EUR'
        }).format(value)
    }

    const selectedProperty = properties.find(p => p.id === selectedPropertyId)

    if (loading) {
        return (
            <div className="loading">
                <div className="loading__spinner" />
            </div>
        )
    }

    if (properties.length === 0) {
        return (
            <div className="empty-state">
                <div className="empty-state__icon">🏠</div>
                <div className="empty-state__title">Keine Immobilien vorhanden</div>
            </div>
        )
    }

    return (
        <div className="page wizard">
            <div className="wizard__header">
                <h1 className="page__title">Nebenkostenabrechnung erstellen</h1>

                <div className="wizard__steps">
                    {STEPS.map((step, index) => (
                        <div
                            key={step}
                            className={`wizard__step ${index === currentStep ? 'wizard__step--active' : ''
                                } ${index < currentStep ? 'wizard__step--completed' : ''}`}
                        >
                            <div className="wizard__step-number">
                                {index < currentStep ? '✓' : index + 1}
                            </div>
                            <span className="wizard__step-label">{step}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="wizard__content">
                {currentStep === 0 && (
                    <>
                        <h2 className="wizard__title">Immobilie auswählen</h2>
                        <SelectField
                            label="Immobilie"
                            value={selectedPropertyId}
                            onChange={setSelectedPropertyId}
                            options={properties.map(p => ({ value: p.id, label: p.name }))}
                        />
                        {tenants.length === 0 && selectedPropertyId && (
                            <p className="text-warning" style={{ marginTop: '16px' }}>
                                ⚠️ Keine aktiven Mieter für diese Immobilie gefunden.
                            </p>
                        )}
                    </>
                )}

                {currentStep === 1 && (
                    <>
                        <h2 className="wizard__title">Abrechnungszeitraum</h2>
                        <SelectField
                            label="Abrechnungsjahr"
                            value={selectedYear.toString()}
                            onChange={value => setSelectedYear(parseInt(value))}
                            options={[
                                { value: (new Date().getFullYear() - 2).toString(), label: (new Date().getFullYear() - 2).toString() },
                                { value: (new Date().getFullYear() - 1).toString(), label: (new Date().getFullYear() - 1).toString() },
                                { value: new Date().getFullYear().toString(), label: new Date().getFullYear().toString() }
                            ]}
                        />
                        <p className="text-secondary" style={{ marginTop: '16px' }}>
                            Zeitraum: 01.01.{selectedYear} - 31.12.{selectedYear}
                        </p>
                    </>
                )}

                {currentStep === 2 && (
                    <>
                        <h2 className="wizard__title">Kosten prüfen</h2>
                        {expenses.length === 0 ? (
                            <p className="text-warning">
                                ⚠️ Keine Kosten für {selectedYear} erfasst. Bitte erst Kosten erfassen.
                            </p>
                        ) : (
                            <table className="summary-table">
                                <thead>
                                    <tr>
                                        <th>Kategorie</th>
                                        <th>Lieferant</th>
                                        <th style={{ textAlign: 'right' }}>Betrag</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {expenses.map(expense => (
                                        <tr key={expense.id}>
                                            <td>{categories.find(c => c.id === expense.categoryId)?.name || '-'}</td>
                                            <td>{expense.vendor}</td>
                                            <td style={{ textAlign: 'right' }}>{formatCurrency(expense.amount)}</td>
                                        </tr>
                                    ))}
                                    <tr className="summary-table__total">
                                        <td colSpan={2}>Gesamt</td>
                                        <td style={{ textAlign: 'right' }}>
                                            {formatCurrency(expenses.reduce((sum, e) => sum + e.amount, 0))}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        )}
                    </>
                )}

                {currentStep === 3 && (
                    <>
                        <h2 className="wizard__title">Verteilerschlüssel</h2>
                        <table className="summary-table">
                            <thead>
                                <tr>
                                    <th>Kostenart</th>
                                    <th>Umlageschlüssel</th>
                                    <th>Umlegbar</th>
                                </tr>
                            </thead>
                            <tbody>
                                {categories.filter(c => c.isRecoverable).map(category => (
                                    <tr key={category.id}>
                                        <td>{category.name}</td>
                                        <td>
                                            {category.distributionKey === 'area' ? 'Wohnfläche' :
                                                category.distributionKey === 'units' ? 'Einheiten' :
                                                    category.distributionKey === 'persons' ? 'Personenzahl' :
                                                        category.distributionKey === 'consumption' ? 'Verbrauch' : 'Fix'}
                                        </td>
                                        <td>✓</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </>
                )}

                {currentStep === 4 && (
                    <>
                        <h2 className="wizard__title">Berechnungsergebnis</h2>
                        {calculatedStatements.map(statement => {
                            const tenant = tenants.find(t => t.id === statement.tenantId)
                            return (
                                <div key={statement.id} className="card" style={{ marginBottom: '16px' }}>
                                    <h3 style={{ marginBottom: '16px' }}>
                                        {tenant?.personalData.firstName} {tenant?.personalData.lastName}
                                    </h3>
                                    <div className="info-grid">
                                        <div className="info-item">
                                            <span className="info-item__label">Gesamtkosten</span>
                                            <span className="info-item__value">{formatCurrency(statement.summary.totalCosts)}</span>
                                        </div>
                                        <div className="info-item">
                                            <span className="info-item__label">Mieteranteil</span>
                                            <span className="info-item__value">{formatCurrency(statement.summary.tenantShare)}</span>
                                        </div>
                                        <div className="info-item">
                                            <span className="info-item__label">Vorauszahlungen</span>
                                            <span className="info-item__value">{formatCurrency(statement.summary.advancePayments)}</span>
                                        </div>
                                        <div className="info-item">
                                            <span className="info-item__label">Saldo</span>
                                            <span className={`info-item__value ${statement.summary.balance >= 0 ? 'text-danger' : 'text-success'}`}>
                                                {statement.summary.balance >= 0 ? 'Nachzahlung: ' : 'Guthaben: '}
                                                {formatCurrency(Math.abs(statement.summary.balance))}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </>
                )}

                {currentStep === 5 && (
                    <>
                        <h2 className="wizard__title">Zusammenfassung</h2>
                        <p style={{ marginBottom: '24px' }}>
                            Die Nebenkostenabrechnung für <strong>{selectedProperty?.name}</strong>
                            {' '}für das Jahr <strong>{selectedYear}</strong> ist bereit.
                        </p>
                        <div className="card" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                            <div className="info-grid">
                                <div className="info-item">
                                    <span className="info-item__label">Immobilie</span>
                                    <span className="info-item__value">{selectedProperty?.name}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-item__label">Abrechnungsjahr</span>
                                    <span className="info-item__value">{selectedYear}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-item__label">Anzahl Mieter</span>
                                    <span className="info-item__value">{calculatedStatements.length}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-item__label">Gesamtkosten</span>
                                    <span className="info-item__value">
                                        {formatCurrency(expenses.reduce((sum, e) => sum + e.amount, 0))}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>

            <div className="wizard__footer">
                <Button variant="secondary" onClick={currentStep === 0 ? () => navigate('/billing') : handleBack}>
                    {currentStep === 0 ? 'Abbrechen' : '← Zurück'}
                </Button>
                <Button
                    onClick={currentStep === STEPS.length - 1 ? handleSave : handleNext}
                    disabled={currentStep === 0 && tenants.length === 0}
                >
                    {currentStep === STEPS.length - 1 ? 'Speichern' : 'Weiter →'}
                </Button>
            </div>
        </div>
    )
}

export default BillingWizard
