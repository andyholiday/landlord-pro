import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Tenant, Property } from '../../types'
import { Button } from '../Shared'
import TenantForm from './TenantForm'
import './Tenants.css'

function TenantList() {
    const [tenants, setTenants] = useState<Tenant[]>([])
    const [properties, setProperties] = useState<Property[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [filter, setFilter] = useState<string>('active')

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            const [tenantsData, propertiesData] = await Promise.all([
                window.electronAPI.tenants.getAll(),
                window.electronAPI.properties.getAll()
            ])
            setTenants(tenantsData)
            setProperties(propertiesData)
        } catch (error) {
            console.error('Failed to load tenants:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleTenantCreated = (newTenant: Tenant) => {
        setTenants(prev => [...prev, newTenant])
        setShowForm(false)
    }

    const getPropertyForTenant = (tenant: Tenant) => {
        return properties.find(p => p.id === tenant.propertyId)
    }

    const getUnitName = (tenant: Tenant) => {
        const property = getPropertyForTenant(tenant)
        if (property?.units) {
            const unit = property.units.find(u => u.id === tenant.unitId)
            return unit?.name || ''
        }
        return property?.name || ''
    }

    const filteredTenants = tenants.filter(tenant => {
        if (filter === 'all') return true
        return tenant.status === filter
    })

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('de-DE', {
            style: 'currency',
            currency: 'EUR'
        }).format(value)
    }

    const getStatusBadge = (status: Tenant['status']) => {
        switch (status) {
            case 'active':
                return <span className="badge badge--success">Aktiv</span>
            case 'notice-given':
                return <span className="badge badge--warning">Gekündigt</span>
            case 'moved-out':
                return <span className="badge badge--neutral">Ausgezogen</span>
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
                <h1 className="page__title">Mieter</h1>
                <div className="page__actions">
                    <Button icon="+" onClick={() => setShowForm(true)} disabled={properties.length === 0}>
                        Neuer Mieter
                    </Button>
                </div>
            </div>

            {properties.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state__icon">🏠</div>
                    <div className="empty-state__title">Erst Immobilie anlegen</div>
                    <div className="empty-state__description">
                        Bevor Sie Mieter anlegen können, müssen Sie mindestens eine Immobilie haben.
                    </div>
                    <Link to="/properties" className="btn btn--primary" style={{ marginTop: '16px' }}>
                        Immobilie anlegen
                    </Link>
                </div>
            ) : (
                <>
                    {/* Filters */}
                    <div className="tenant-filters">
                        <button
                            className={`filter-tab ${filter === 'active' ? 'filter-tab--active' : ''}`}
                            onClick={() => setFilter('active')}
                        >
                            Aktiv ({tenants.filter(t => t.status === 'active').length})
                        </button>
                        <button
                            className={`filter-tab ${filter === 'notice-given' ? 'filter-tab--active' : ''}`}
                            onClick={() => setFilter('notice-given')}
                        >
                            Gekündigt
                        </button>
                        <button
                            className={`filter-tab ${filter === 'moved-out' ? 'filter-tab--active' : ''}`}
                            onClick={() => setFilter('moved-out')}
                        >
                            Ausgezogen
                        </button>
                        <button
                            className={`filter-tab ${filter === 'all' ? 'filter-tab--active' : ''}`}
                            onClick={() => setFilter('all')}
                        >
                            Alle ({tenants.length})
                        </button>
                    </div>

                    {/* Tenant List */}
                    {filteredTenants.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state__icon">👤</div>
                            <div className="empty-state__title">Keine Mieter gefunden</div>
                            <div className="empty-state__description">
                                {filter === 'active'
                                    ? 'Sie haben noch keine aktiven Mieter.'
                                    : 'Keine Mieter in dieser Kategorie.'}
                            </div>
                        </div>
                    ) : (
                        <div className="tenant-list">
                            {filteredTenants.map(tenant => {
                                const property = getPropertyForTenant(tenant)
                                return (
                                    <Link key={tenant.id} to={`/tenants/${tenant.id}`} className="tenant-card card card--hover">
                                        <div className="tenant-card__header">
                                            <div className="tenant-card__avatar">
                                                {tenant.personalData.firstName[0]}{tenant.personalData.lastName[0]}
                                            </div>
                                            <div className="tenant-card__info">
                                                <h3 className="tenant-card__name">
                                                    {tenant.personalData.firstName} {tenant.personalData.lastName}
                                                </h3>
                                                <p className="tenant-card__unit">
                                                    {property?.name}, {getUnitName(tenant)}
                                                </p>
                                            </div>
                                            {getStatusBadge(tenant.status)}
                                        </div>
                                        <div className="tenant-card__details">
                                            <div className="tenant-card__detail">
                                                <span className="tenant-card__detail-label">Mietbeginn</span>
                                                <span className="tenant-card__detail-value">
                                                    {new Date(tenant.contract.startDate).toLocaleDateString('de-DE')}
                                                </span>
                                            </div>
                                            <div className="tenant-card__detail">
                                                <span className="tenant-card__detail-label">Miete</span>
                                                <span className="tenant-card__detail-value">
                                                    {formatCurrency(tenant.contract.baseRent + tenant.contract.additionalCostsAdvance)}
                                                </span>
                                            </div>
                                            <div className="tenant-card__detail">
                                                <span className="tenant-card__detail-label">Kaution</span>
                                                <span className="tenant-card__detail-value">
                                                    {tenant.contract.depositPaid ? '✓ Bezahlt' : '○ Offen'}
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                )
                            })}
                        </div>
                    )}
                </>
            )}

            {/* New Tenant Form Modal */}
            {showForm && (
                <TenantForm
                    properties={properties}
                    onClose={() => setShowForm(false)}
                    onSave={handleTenantCreated}
                />
            )}
        </div>
    )
}

export default TenantList
