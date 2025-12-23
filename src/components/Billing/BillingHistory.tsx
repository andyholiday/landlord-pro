import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { BillingStatement, Property } from '../../types'
import { Button } from '../Shared'
import './Billing.css'

function BillingHistory() {
    const [statements, setStatements] = useState<BillingStatement[]>([])
    const [properties, setProperties] = useState<Property[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            const [statementsData, propertiesData] = await Promise.all([
                window.electronAPI.billing.getHistory(),
                window.electronAPI.properties.getAll()
            ])
            setStatements(statementsData)
            setProperties(propertiesData)
        } catch (error) {
            console.error('Failed to load billing data:', error)
        } finally {
            setLoading(false)
        }
    }

    const getPropertyName = (propertyId: string) => {
        return properties.find(p => p.id === propertyId)?.name || 'Unbekannt'
    }

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('de-DE', {
            style: 'currency',
            currency: 'EUR'
        }).format(value)
    }

    const getStatusBadge = (status: BillingStatement['status']) => {
        switch (status) {
            case 'draft':
                return <span className="badge badge--neutral">Entwurf</span>
            case 'sent':
                return <span className="badge badge--warning">Versendet</span>
            case 'paid':
                return <span className="badge badge--success">Bezahlt</span>
            case 'disputed':
                return <span className="badge badge--danger">Einspruch</span>
        }
    }

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
                <h1 className="page__title">Nebenkostenabrechnungen</h1>
                <div className="page__actions">
                    <Link to="/billing/new" className="btn btn--primary">
                        + Neue Abrechnung
                    </Link>
                </div>
            </div>

            {statements.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state__icon">📄</div>
                    <div className="empty-state__title">Noch keine Abrechnungen</div>
                    <div className="empty-state__description">
                        Erstellen Sie Ihre erste Nebenkostenabrechnung.
                    </div>
                    <Link to="/billing/new" className="btn btn--primary" style={{ marginTop: '16px' }}>
                        Abrechnung erstellen
                    </Link>
                </div>
            ) : (
                <div className="billing-list">
                    {statements.map(statement => (
                        <div key={statement.id} className="billing-card card">
                            <div className="billing-card__header">
                                <div className="billing-card__info">
                                    <h3 className="billing-card__title">
                                        Abrechnung {statement.billingPeriod.year}
                                    </h3>
                                    <p className="billing-card__property">
                                        {getPropertyName(statement.propertyId)}
                                    </p>
                                </div>
                                {getStatusBadge(statement.status)}
                            </div>
                            <div className="billing-card__details">
                                <div className="billing-card__detail">
                                    <span className="billing-card__detail-label">Gesamtkosten</span>
                                    <span className="billing-card__detail-value">
                                        {formatCurrency(statement.summary.totalCosts)}
                                    </span>
                                </div>
                                <div className="billing-card__detail">
                                    <span className="billing-card__detail-label">Mieteranteil</span>
                                    <span className="billing-card__detail-value">
                                        {formatCurrency(statement.summary.tenantShare)}
                                    </span>
                                </div>
                                <div className="billing-card__detail">
                                    <span className="billing-card__detail-label">Vorauszahlungen</span>
                                    <span className="billing-card__detail-value">
                                        {formatCurrency(statement.summary.advancePayments)}
                                    </span>
                                </div>
                                <div className="billing-card__detail billing-card__detail--highlight">
                                    <span className="billing-card__detail-label">Saldo</span>
                                    <span className={`billing-card__detail-value ${statement.summary.balance >= 0 ? 'text-danger' : 'text-success'}`}>
                                        {statement.summary.balance >= 0 ? 'Nachzahlung: ' : 'Guthaben: '}
                                        {formatCurrency(Math.abs(statement.summary.balance))}
                                    </span>
                                </div>
                            </div>
                            <div className="billing-card__footer">
                                <span className="billing-card__date">
                                    Erstellt: {new Date(statement.createdAt).toLocaleDateString('de-DE')}
                                </span>
                                <Button variant="ghost" size="sm">
                                    Details →
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default BillingHistory
