import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Property } from '../../types'
import './Dashboard.css'

interface DashboardStats {
    totalProperties: number
    totalUnits: number
    totalTenants: number
    occupancyRate: number
    monthlyIncome: number
}

function Dashboard() {
    const [properties, setProperties] = useState<Property[]>([])
    const [stats, setStats] = useState<DashboardStats>({
        totalProperties: 0,
        totalUnits: 0,
        totalTenants: 0,
        occupancyRate: 0,
        monthlyIncome: 0
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            const [propertiesData, tenantsData] = await Promise.all([
                window.electronAPI.properties.getAll(),
                window.electronAPI.tenants.getAll()
            ])

            setProperties(propertiesData)

            // Calculate stats
            let totalUnits = 0
            let monthlyIncome = 0

            propertiesData.forEach(property => {
                if (property.units) {
                    totalUnits += property.units.length
                    property.units.forEach(unit => {
                        if (unit.currentTenantId) {
                            monthlyIncome += unit.baseRent + unit.additionalCostsAdvance
                        }
                    })
                } else if (property.type !== 'multi-family') {
                    totalUnits += 1
                }
            })

            const activeTenants = tenantsData.filter(t => t.status === 'active').length
            const occupancyRate = totalUnits > 0 ? (activeTenants / totalUnits) * 100 : 0

            setStats({
                totalProperties: propertiesData.length,
                totalUnits,
                totalTenants: activeTenants,
                occupancyRate,
                monthlyIncome
            })
        } catch (error) {
            console.error('Failed to load dashboard data:', error)
        } finally {
            setLoading(false)
        }
    }

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('de-DE', {
            style: 'currency',
            currency: 'EUR'
        }).format(value)
    }

    if (loading) {
        return (
            <div className="loading">
                <div className="loading__spinner" />
            </div>
        )
    }

    return (
        <div className="page dashboard">
            <div className="page__header">
                <h1 className="page__title">Dashboard</h1>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-card__label">Immobilien</div>
                    <div className="stat-card__value">{stats.totalProperties}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-card__label">Einheiten</div>
                    <div className="stat-card__value">{stats.totalUnits}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-card__label">Aktive Mieter</div>
                    <div className="stat-card__value">{stats.totalTenants}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-card__label">Auslastung</div>
                    <div className="stat-card__value">{stats.occupancyRate.toFixed(0)}%</div>
                </div>
                <div className="stat-card stat-card--highlight">
                    <div className="stat-card__label">Monatliche Einnahmen</div>
                    <div className="stat-card__value">{formatCurrency(stats.monthlyIncome)}</div>
                </div>
            </div>

            {/* Quick Actions */}
            <section className="dashboard__section">
                <h2 className="dashboard__section-title">Schnellzugriff</h2>
                <div className="dashboard__quick-actions">
                    <Link to="/properties" className="quick-action">
                        <span className="quick-action__icon">🏢</span>
                        <span className="quick-action__label">Neue Immobilie</span>
                    </Link>
                    <Link to="/tenants" className="quick-action">
                        <span className="quick-action__icon">👤</span>
                        <span className="quick-action__label">Neuer Mieter</span>
                    </Link>
                    <Link to="/expenses" className="quick-action">
                        <span className="quick-action__icon">💰</span>
                        <span className="quick-action__label">Kosten erfassen</span>
                    </Link>
                    <Link to="/billing/new" className="quick-action">
                        <span className="quick-action__icon">📄</span>
                        <span className="quick-action__label">Abrechnung erstellen</span>
                    </Link>
                </div>
            </section>

            {/* Properties Overview */}
            <section className="dashboard__section">
                <div className="dashboard__section-header">
                    <h2 className="dashboard__section-title">Meine Immobilien</h2>
                    <Link to="/properties" className="btn btn--ghost btn--sm">
                        Alle anzeigen →
                    </Link>
                </div>

                {properties.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state__icon">🏠</div>
                        <div className="empty-state__title">Noch keine Immobilien</div>
                        <div className="empty-state__description">
                            Fügen Sie Ihre erste Immobilie hinzu, um loszulegen.
                        </div>
                        <Link to="/properties" className="btn btn--primary" style={{ marginTop: '16px' }}>
                            Immobilie anlegen
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid--auto">
                        {properties.slice(0, 4).map(property => (
                            <Link key={property.id} to={`/properties/${property.id}`} className="property-card card card--hover">
                                <div className="property-card__header">
                                    <span className="property-card__icon">
                                        {property.type === 'apartment' ? '🏢' : property.type === 'house' ? '🏠' : '🏘️'}
                                    </span>
                                    <span className="property-card__type">
                                        {property.type === 'apartment' ? 'Wohnung' :
                                            property.type === 'house' ? 'Haus' : 'Mehrfamilienhaus'}
                                    </span>
                                </div>
                                <h3 className="property-card__name">{property.name}</h3>
                                <p className="property-card__address">
                                    {property.address.street} {property.address.houseNumber}, {property.address.postalCode} {property.address.city}
                                </p>
                                <div className="property-card__stats">
                                    <span>{property.buildingData.totalArea} m²</span>
                                    {property.units && <span>{property.units.length} Einheiten</span>}
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </section>
        </div>
    )
}

export default Dashboard
