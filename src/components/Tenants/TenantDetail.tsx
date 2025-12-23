import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Tenant, Property } from '../../types'
import { Button, ConfirmDialog } from '../Shared'
import TenantForm from './TenantForm'
import './Tenants.css'

function TenantDetail() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const [tenant, setTenant] = useState<Tenant | null>(null)
    const [property, setProperty] = useState<Property | null>(null)
    const [properties, setProperties] = useState<Property[]>([])
    const [loading, setLoading] = useState(true)
    const [showEditForm, setShowEditForm] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

    useEffect(() => {
        if (id) loadTenant()
    }, [id])

    const loadTenant = async () => {
        try {
            const tenantsData = await window.electronAPI.tenants.getAll()
            const tenantData = tenantsData.find(t => t.id === id)
            setTenant(tenantData || null)

            if (tenantData) {
                const propertyData = await window.electronAPI.properties.getById(tenantData.propertyId)
                setProperty(propertyData)
            }

            const allProperties = await window.electronAPI.properties.getAll()
            setProperties(allProperties)
        } catch (error) {
            console.error('Failed to load tenant:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async () => {
        try {
            await window.electronAPI.tenants.delete(id!)
            navigate('/tenants')
        } catch (error) {
            console.error('Failed to delete tenant:', error)
        }
    }

    const handleUpdate = (updatedTenant: Tenant) => {
        setTenant(updatedTenant)
        setShowEditForm(false)
    }

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('de-DE', {
            style: 'currency',
            currency: 'EUR'
        }).format(value)
    }

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('de-DE')
    }

    const getUnitName = () => {
        if (property?.units) {
            const unit = property.units.find(u => u.id === tenant?.unitId)
            return unit?.name || 'Unbekannt'
        }
        return property?.name || 'Unbekannt'
    }

    const getStatusLabel = (status: Tenant['status']) => {
        switch (status) {
            case 'active': return 'Aktiv'
            case 'notice-given': return 'Gekündigt'
            case 'moved-out': return 'Ausgezogen'
        }
    }

    if (loading) {
        return (
            <div className="loading">
                <div className="loading__spinner" />
            </div>
        )
    }

    if (!tenant) {
        return (
            <div className="empty-state">
                <div className="empty-state__icon">❓</div>
                <div className="empty-state__title">Mieter nicht gefunden</div>
            </div>
        )
    }

    const totalRent = tenant.contract.baseRent + tenant.contract.additionalCostsAdvance

    return (
        <div className="page">
            <div className="page__header">
                <div>
                    <h1 className="page__title">
                        {tenant.personalData.firstName} {tenant.personalData.lastName}
                    </h1>
                    <p className="text-secondary" style={{ marginTop: '4px' }}>
                        {property?.name}, {getUnitName()}
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

            <div className="tenant-detail">
                <div className="tenant-detail__main">
                    {/* Contact Info */}
                    <section className="tenant-detail__section">
                        <h2 className="tenant-detail__section-title">
                            <span>📇</span> Kontaktdaten
                        </h2>
                        <div className="info-grid">
                            <div className="info-item">
                                <span className="info-item__label">Anrede</span>
                                <span className="info-item__value">
                                    {tenant.personalData.salutation === 'mr' ? 'Herr' :
                                        tenant.personalData.salutation === 'mrs' ? 'Frau' : 'Divers'}
                                </span>
                            </div>
                            <div className="info-item">
                                <span className="info-item__label">Status</span>
                                <span className="info-item__value">{getStatusLabel(tenant.status)}</span>
                            </div>
                            {tenant.personalData.email && (
                                <div className="info-item">
                                    <span className="info-item__label">E-Mail</span>
                                    <span className="info-item__value">{tenant.personalData.email}</span>
                                </div>
                            )}
                            {tenant.personalData.phone && (
                                <div className="info-item">
                                    <span className="info-item__label">Telefon</span>
                                    <span className="info-item__value">{tenant.personalData.phone}</span>
                                </div>
                            )}
                            {tenant.personalData.mobile && (
                                <div className="info-item">
                                    <span className="info-item__label">Mobil</span>
                                    <span className="info-item__value">{tenant.personalData.mobile}</span>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Contract Info */}
                    <section className="tenant-detail__section">
                        <h2 className="tenant-detail__section-title">
                            <span>📋</span> Mietvertrag
                        </h2>
                        <div className="info-grid">
                            <div className="info-item">
                                <span className="info-item__label">Mietbeginn</span>
                                <span className="info-item__value">{formatDate(tenant.contract.startDate)}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-item__label">Mietende</span>
                                <span className="info-item__value">
                                    {tenant.contract.endDate ? formatDate(tenant.contract.endDate) : 'Unbefristet'}
                                </span>
                            </div>
                            <div className="info-item">
                                <span className="info-item__label">Kaltmiete</span>
                                <span className="info-item__value">{formatCurrency(tenant.contract.baseRent)}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-item__label">NK-Vorauszahlung</span>
                                <span className="info-item__value">{formatCurrency(tenant.contract.additionalCostsAdvance)}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-item__label">Fälligkeitstag</span>
                                <span className="info-item__value">{tenant.contract.rentDueDay}. des Monats</span>
                            </div>
                            <div className="info-item">
                                <span className="info-item__label">Zahlungsart</span>
                                <span className="info-item__value">
                                    {tenant.contract.paymentMethod === 'transfer' ? 'Überweisung' : 'Lastschrift'}
                                </span>
                            </div>
                        </div>
                    </section>

                    {/* Correspondence */}
                    <section className="tenant-detail__section">
                        <h2 className="tenant-detail__section-title">
                            <span>✉️</span> Korrespondenz
                        </h2>
                        {tenant.correspondence && tenant.correspondence.length > 0 ? (
                            <div className="correspondence-list">
                                {tenant.correspondence.map(entry => (
                                    <div key={entry.id} className="correspondence-item">
                                        <span className="correspondence-item__icon">
                                            {entry.type === 'email' ? '📧' :
                                                entry.type === 'letter' ? '📬' :
                                                    entry.type === 'phone' ? '📞' : '👤'}
                                        </span>
                                        <div className="correspondence-item__content">
                                            <div className="correspondence-item__header">
                                                <span className="correspondence-item__subject">{entry.subject}</span>
                                                <span className="correspondence-item__date">{formatDate(entry.date)}</span>
                                            </div>
                                            <p className="correspondence-item__text">{entry.content}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-secondary">Noch keine Korrespondenz dokumentiert.</p>
                        )}
                    </section>
                </div>

                <div className="tenant-detail__sidebar">
                    {/* Financial Summary */}
                    <section className="tenant-detail__section">
                        <h2 className="tenant-detail__section-title">
                            <span>💰</span> Finanzen
                        </h2>
                        <div className="financial-summary">
                            <div className="financial-row">
                                <span className="financial-row__label">Warmmiete</span>
                                <span className="financial-row__value">{formatCurrency(totalRent)}</span>
                            </div>
                            <div className="financial-row">
                                <span className="financial-row__label">Kaution</span>
                                <span className="financial-row__value">{formatCurrency(tenant.contract.deposit)}</span>
                            </div>
                            <div className="financial-row">
                                <span className="financial-row__label">Kaution-Status</span>
                                <span className="financial-row__value">
                                    {tenant.contract.depositPaid
                                        ? <span className="text-success">Bezahlt</span>
                                        : <span className="text-warning">Offen</span>}
                                </span>
                            </div>
                            <div className="financial-row financial-row--total">
                                <span className="financial-row__label">Jahresmiete</span>
                                <span className="financial-row__value">{formatCurrency(totalRent * 12)}</span>
                            </div>
                        </div>
                    </section>

                    {/* Quick Stats */}
                    <section className="tenant-detail__section">
                        <h2 className="tenant-detail__section-title">
                            <span>📊</span> Statistik
                        </h2>
                        <div className="info-grid" style={{ gridTemplateColumns: '1fr' }}>
                            <div className="info-item">
                                <span className="info-item__label">Mietdauer</span>
                                <span className="info-item__value">
                                    {Math.floor((new Date().getTime() - new Date(tenant.contract.startDate).getTime()) / (1000 * 60 * 60 * 24 * 30))} Monate
                                </span>
                            </div>
                            <div className="info-item">
                                <span className="info-item__label">Gesamtzahlungen (geschätzt)</span>
                                <span className="info-item__value">
                                    {formatCurrency(
                                        Math.floor((new Date().getTime() - new Date(tenant.contract.startDate).getTime()) / (1000 * 60 * 60 * 24 * 30)) * totalRent
                                    )}
                                </span>
                            </div>
                        </div>
                    </section>
                </div>
            </div>

            {/* Edit Modal */}
            {showEditForm && (
                <TenantForm
                    tenant={tenant}
                    properties={properties}
                    onClose={() => setShowEditForm(false)}
                    onSave={handleUpdate}
                />
            )}

            {/* Delete Confirmation */}
            <ConfirmDialog
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={handleDelete}
                title="Mieter löschen"
                message={`Möchten Sie "${tenant.personalData.firstName} ${tenant.personalData.lastName}" wirklich löschen?`}
                confirmLabel="Löschen"
                variant="danger"
            />
        </div>
    )
}

export default TenantDetail
