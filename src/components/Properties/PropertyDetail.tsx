import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Property, Tenant, PropertyUnit } from '../../types'
import { Button, ConfirmDialog } from '../Shared'
import PropertyForm from './PropertyForm'
import './Properties.css'

function PropertyDetail() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const [property, setProperty] = useState<Property | null>(null)
    const [tenants, setTenants] = useState<Tenant[]>([])
    const [loading, setLoading] = useState(true)
    const [showEditForm, setShowEditForm] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

    useEffect(() => {
        if (id) loadProperty()
    }, [id])

    const loadProperty = async () => {
        try {
            const [propertyData, tenantsData] = await Promise.all([
                window.electronAPI.properties.getById(id!),
                window.electronAPI.tenants.getByProperty(id!)
            ])
            setProperty(propertyData)
            setTenants(tenantsData)
        } catch (error) {
            console.error('Failed to load property:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async () => {
        try {
            await window.electronAPI.properties.delete(id!)
            navigate('/properties')
        } catch (error) {
            console.error('Failed to delete property:', error)
        }
    }

    const handleUpdate = (updatedProperty: Property) => {
        setProperty(updatedProperty)
        setShowEditForm(false)
    }

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('de-DE', {
            style: 'currency',
            currency: 'EUR'
        }).format(value)
    }

    const getHeatingLabel = (type: string) => {
        const labels: Record<string, string> = {
            'gas': 'Gas',
            'oil': 'Öl',
            'district': 'Fernwärme',
            'heat-pump': 'Wärmepumpe',
            'electric': 'Elektrisch',
            'other': 'Sonstige'
        }
        return labels[type] || type
    }

    const getTenantForUnit = (unit: PropertyUnit) => {
        return tenants.find(t => t.unitId === unit.id && t.status === 'active')
    }

    if (loading) {
        return (
            <div className="loading">
                <div className="loading__spinner" />
            </div>
        )
    }

    if (!property) {
        return (
            <div className="empty-state">
                <div className="empty-state__icon">❓</div>
                <div className="empty-state__title">Immobilie nicht gefunden</div>
            </div>
        )
    }

    const totalMonthlyRent = property.units?.reduce((sum, unit) => {
        const tenant = getTenantForUnit(unit)
        if (tenant) {
            return sum + unit.baseRent + unit.additionalCostsAdvance
        }
        return sum
    }, 0) || 0

    return (
        <div className="page">
            <div className="page__header">
                <div>
                    <h1 className="page__title">{property.name}</h1>
                    <p className="text-secondary" style={{ marginTop: '4px' }}>
                        {property.address.street} {property.address.houseNumber}, {property.address.postalCode} {property.address.city}
                    </p>
                </div>
                <div className="page__actions">
                    <Button variant="secondary" onClick={() => setShowEditForm(true)}>
                        Bearbeiten
                    </Button>
                    <Button variant="danger" onClick={() => setShowDeleteConfirm(true)}>
                        Löschen
                    </Button>
                </div>
            </div>

            <div className="property-detail">
                <div className="property-detail__main">
                    {/* Building Info */}
                    <section className="property-detail__section">
                        <h2 className="property-detail__section-title">
                            <span className="property-detail__section-title-icon">🏠</span>
                            Gebäudedaten
                        </h2>
                        <div className="info-grid">
                            <div className="info-item">
                                <span className="info-item__label">Immobilientyp</span>
                                <span className="info-item__value">
                                    {property.type === 'apartment' ? 'Wohnung' :
                                        property.type === 'house' ? 'Haus' : 'Mehrfamilienhaus'}
                                </span>
                            </div>
                            <div className="info-item">
                                <span className="info-item__label">Baujahr</span>
                                <span className="info-item__value">{property.buildingData.yearBuilt}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-item__label">Gesamtfläche</span>
                                <span className="info-item__value">{property.buildingData.totalArea} m²</span>
                            </div>
                            <div className="info-item">
                                <span className="info-item__label">Etagen</span>
                                <span className="info-item__value">{property.buildingData.floors}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-item__label">Heizungsart</span>
                                <span className="info-item__value">{getHeatingLabel(property.buildingData.heatingType)}</span>
                            </div>
                            {property.buildingData.energyClass && (
                                <div className="info-item">
                                    <span className="info-item__label">Energieklasse</span>
                                    <span className="info-item__value">{property.buildingData.energyClass}</span>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Units */}
                    {property.type === 'multi-family' && (
                        <section className="property-detail__section">
                            <h2 className="property-detail__section-title">
                                <span className="property-detail__section-title-icon">🚪</span>
                                Wohneinheiten ({property.units?.length || 0})
                            </h2>

                            {property.units && property.units.length > 0 ? (
                                <div className="unit-list">
                                    {property.units.map(unit => {
                                        const tenant = getTenantForUnit(unit)
                                        return (
                                            <div key={unit.id} className="unit-item">
                                                <div className="unit-item__info">
                                                    <span className="unit-item__name">{unit.name}</span>
                                                    <span className="unit-item__details">
                                                        {unit.area} m² • {unit.rooms} Zimmer • Etage {unit.floor}
                                                    </span>
                                                </div>
                                                <div className="unit-item__status">
                                                    <span className="unit-item__rent">
                                                        {formatCurrency(unit.baseRent)} + {formatCurrency(unit.additionalCostsAdvance)} NK
                                                    </span>
                                                    <span className="unit-item__tenant">
                                                        {tenant
                                                            ? `${tenant.personalData.firstName} ${tenant.personalData.lastName}`
                                                            : 'Leerstand'}
                                                    </span>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            ) : (
                                <p className="text-secondary">Noch keine Einheiten angelegt.</p>
                            )}
                        </section>
                    )}

                    {/* Tenants */}
                    <section className="property-detail__section">
                        <h2 className="property-detail__section-title">
                            <span className="property-detail__section-title-icon">👥</span>
                            Mieter ({tenants.filter(t => t.status === 'active').length})
                        </h2>

                        {tenants.length > 0 ? (
                            <div className="unit-list">
                                {tenants.filter(t => t.status === 'active').map(tenant => (
                                    <div key={tenant.id} className="unit-item">
                                        <div className="unit-item__info">
                                            <span className="unit-item__name">
                                                {tenant.personalData.firstName} {tenant.personalData.lastName}
                                            </span>
                                            <span className="unit-item__details">
                                                Seit {new Date(tenant.contract.startDate).toLocaleDateString('de-DE')}
                                            </span>
                                        </div>
                                        <div className="unit-item__status">
                                            <span className="unit-item__rent">
                                                {formatCurrency(tenant.contract.baseRent + tenant.contract.additionalCostsAdvance)}
                                            </span>
                                            <span className="unit-item__tenant">pro Monat</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-secondary">Noch keine Mieter angelegt.</p>
                        )}
                    </section>
                </div>

                <div className="property-detail__sidebar">
                    {/* Financial Summary */}
                    <section className="property-detail__section">
                        <h2 className="property-detail__section-title">
                            <span className="property-detail__section-title-icon">💰</span>
                            Finanzen
                        </h2>
                        <div className="financial-summary">
                            <div className="financial-row">
                                <span className="financial-row__label">Monatliche Einnahmen</span>
                                <span className="financial-row__value">{formatCurrency(totalMonthlyRent)}</span>
                            </div>
                            <div className="financial-row">
                                <span className="financial-row__label">Grundsteuer/Jahr</span>
                                <span className="financial-row__value">{formatCurrency(property.annualCosts.propertyTax)}</span>
                            </div>
                            <div className="financial-row">
                                <span className="financial-row__label">Versicherung/Jahr</span>
                                <span className="financial-row__value">{formatCurrency(property.annualCosts.buildingInsurance)}</span>
                            </div>
                            <div className="financial-row financial-row--total">
                                <span className="financial-row__label">Jahreseinnahmen</span>
                                <span className="financial-row__value">{formatCurrency(totalMonthlyRent * 12)}</span>
                            </div>
                        </div>
                    </section>

                    {/* Notes */}
                    {property.notes && (
                        <section className="property-detail__section">
                            <h2 className="property-detail__section-title">
                                <span className="property-detail__section-title-icon">📝</span>
                                Notizen
                            </h2>
                            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                                {property.notes}
                            </p>
                        </section>
                    )}
                </div>
            </div>

            {/* Edit Modal */}
            {showEditForm && (
                <PropertyForm
                    property={property}
                    onClose={() => setShowEditForm(false)}
                    onSave={handleUpdate}
                />
            )}

            {/* Delete Confirmation */}
            <ConfirmDialog
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={handleDelete}
                title="Immobilie löschen"
                message={`Möchten Sie "${property.name}" wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.`}
                confirmLabel="Löschen"
                variant="danger"
            />
        </div>
    )
}

export default PropertyDetail
