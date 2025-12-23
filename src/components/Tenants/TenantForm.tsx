import { useState, useEffect } from 'react'
import { Tenant, Property, PropertyUnit, Salutation, PaymentMethod } from '../../types'
import { Modal, Button, SelectField, CheckboxField } from '../Shared'
import { FormField } from '../Shared/FormField'

interface TenantFormProps {
    tenant?: Tenant
    properties: Property[]
    onClose: () => void
    onSave: (tenant: Tenant) => void
}

const salutations: { value: Salutation; label: string }[] = [
    { value: 'mr', label: 'Herr' },
    { value: 'mrs', label: 'Frau' },
    { value: 'diverse', label: 'Divers' }
]

const paymentMethods: { value: PaymentMethod; label: string }[] = [
    { value: 'transfer', label: 'Überweisung' },
    { value: 'direct-debit', label: 'Lastschrift' }
]

function TenantForm({ tenant, properties, onClose, onSave }: TenantFormProps) {
    const isEditing = !!tenant

    const [selectedPropertyId, setSelectedPropertyId] = useState(tenant?.propertyId || '')
    const [availableUnits, setAvailableUnits] = useState<PropertyUnit[]>([])

    const [formData, setFormData] = useState({
        propertyId: tenant?.propertyId || '',
        unitId: tenant?.unitId || '',
        salutation: tenant?.personalData.salutation || 'mr' as Salutation,
        firstName: tenant?.personalData.firstName || '',
        lastName: tenant?.personalData.lastName || '',
        email: tenant?.personalData.email || '',
        phone: tenant?.personalData.phone || '',
        mobile: tenant?.personalData.mobile || '',
        startDate: tenant?.contract.startDate || new Date().toISOString().split('T')[0],
        endDate: tenant?.contract.endDate || '',
        baseRent: tenant?.contract.baseRent || 0,
        additionalCostsAdvance: tenant?.contract.additionalCostsAdvance || 0,
        deposit: tenant?.contract.deposit || 0,
        depositPaid: tenant?.contract.depositPaid || false,
        rentDueDay: tenant?.contract.rentDueDay || 1,
        paymentMethod: tenant?.contract.paymentMethod || 'transfer' as PaymentMethod
    })

    const [saving, setSaving] = useState(false)
    const [errors, setErrors] = useState<Record<string, string>>({})

    useEffect(() => {
        if (selectedPropertyId) {
            const property = properties.find(p => p.id === selectedPropertyId)
            if (property?.type === 'multi-family' && property.units) {
                setAvailableUnits(property.units)
            } else {
                setAvailableUnits([])
                // For single properties, use property ID as unit ID
                setFormData(prev => ({ ...prev, unitId: selectedPropertyId }))
            }
        }
    }, [selectedPropertyId, properties])

    const updateField = <K extends keyof typeof formData>(field: K, value: typeof formData[K]) => {
        setFormData(prev => ({ ...prev, [field]: value }))
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }))
        }
    }

    const validate = () => {
        const newErrors: Record<string, string> = {}

        if (!formData.propertyId) newErrors.propertyId = 'Immobilie ist erforderlich'
        if (!formData.firstName.trim()) newErrors.firstName = 'Vorname ist erforderlich'
        if (!formData.lastName.trim()) newErrors.lastName = 'Nachname ist erforderlich'
        if (!formData.startDate) newErrors.startDate = 'Mietbeginn ist erforderlich'
        if (formData.baseRent <= 0) newErrors.baseRent = 'Kaltmiete muss größer als 0 sein'
        if (formData.rentDueDay < 1 || formData.rentDueDay > 28) {
            newErrors.rentDueDay = 'Tag muss zwischen 1 und 28 liegen'
        }
        if (availableUnits.length > 0 && !formData.unitId) {
            newErrors.unitId = 'Wohneinheit ist erforderlich'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async () => {
        if (!validate()) return

        setSaving(true)
        try {
            const tenantData = {
                propertyId: formData.propertyId,
                unitId: formData.unitId || formData.propertyId,
                personalData: {
                    salutation: formData.salutation,
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    email: formData.email || undefined,
                    phone: formData.phone || undefined,
                    mobile: formData.mobile || undefined
                },
                contract: {
                    startDate: formData.startDate,
                    endDate: formData.endDate || undefined,
                    baseRent: formData.baseRent,
                    additionalCostsAdvance: formData.additionalCostsAdvance,
                    deposit: formData.deposit,
                    depositPaid: formData.depositPaid,
                    rentDueDay: formData.rentDueDay,
                    paymentMethod: formData.paymentMethod
                },
                correspondence: tenant?.correspondence || [],
                status: tenant?.status || 'active',
                documents: tenant?.documents || []
            }

            let savedTenant: Tenant
            if (isEditing && tenant) {
                savedTenant = await window.electronAPI.tenants.update(tenant.id, tenantData)
            } else {
                savedTenant = await window.electronAPI.tenants.create(tenantData as any)
            }

            onSave(savedTenant)
        } catch (error) {
            console.error('Failed to save tenant:', error)
        } finally {
            setSaving(false)
        }
    }

    const propertyOptions = properties.map(p => ({
        value: p.id,
        label: p.name
    }))

    const unitOptions = availableUnits.map(u => ({
        value: u.id,
        label: `${u.name} (${u.area} m², ${u.rooms} Zimmer)`
    }))

    return (
        <Modal
            isOpen={true}
            onClose={onClose}
            title={isEditing ? 'Mieter bearbeiten' : 'Neuer Mieter'}
            size="lg"
            footer={
                <>
                    <Button variant="secondary" onClick={onClose}>Abbrechen</Button>
                    <Button onClick={handleSubmit} loading={saving}>
                        {isEditing ? 'Speichern' : 'Anlegen'}
                    </Button>
                </>
            }
        >
            <div className="form-section">
                <h3 className="form-section__title">Wohneinheit</h3>

                <div className="form-row form-row--2">
                    <SelectField
                        label="Immobilie"
                        value={selectedPropertyId}
                        onChange={value => {
                            setSelectedPropertyId(value)
                            updateField('propertyId', value)
                            updateField('unitId', '')
                        }}
                        options={propertyOptions}
                        placeholder="Immobilie wählen..."
                        error={errors.propertyId}
                        required
                    />
                    {availableUnits.length > 0 && (
                        <SelectField
                            label="Wohneinheit"
                            value={formData.unitId}
                            onChange={value => updateField('unitId', value)}
                            options={unitOptions}
                            placeholder="Einheit wählen..."
                            error={errors.unitId}
                            required
                        />
                    )}
                </div>
            </div>

            <div className="form-section">
                <h3 className="form-section__title">Persönliche Daten</h3>

                <div className="form-row form-row--3">
                    <SelectField
                        label="Anrede"
                        value={formData.salutation}
                        onChange={value => updateField('salutation', value as Salutation)}
                        options={salutations}
                    />
                    <FormField
                        label="Vorname"
                        value={formData.firstName}
                        onChange={e => updateField('firstName', e.target.value)}
                        error={errors.firstName}
                        required
                    />
                    <FormField
                        label="Nachname"
                        value={formData.lastName}
                        onChange={e => updateField('lastName', e.target.value)}
                        error={errors.lastName}
                        required
                    />
                </div>

                <div className="form-row form-row--3">
                    <FormField
                        label="E-Mail"
                        type="email"
                        value={formData.email}
                        onChange={e => updateField('email', e.target.value)}
                    />
                    <FormField
                        label="Telefon"
                        type="tel"
                        value={formData.phone}
                        onChange={e => updateField('phone', e.target.value)}
                    />
                    <FormField
                        label="Mobil"
                        type="tel"
                        value={formData.mobile}
                        onChange={e => updateField('mobile', e.target.value)}
                    />
                </div>
            </div>

            <div className="form-section">
                <h3 className="form-section__title">Mietvertrag</h3>

                <div className="form-row form-row--2">
                    <FormField
                        label="Mietbeginn"
                        type="date"
                        value={formData.startDate}
                        onChange={e => updateField('startDate', e.target.value)}
                        error={errors.startDate}
                        required
                    />
                    <FormField
                        label="Mietende (leer = unbefristet)"
                        type="date"
                        value={formData.endDate}
                        onChange={e => updateField('endDate', e.target.value)}
                    />
                </div>

                <div className="form-row form-row--3">
                    <FormField
                        label="Kaltmiete (€)"
                        type="number"
                        value={formData.baseRent}
                        onChange={e => updateField('baseRent', parseFloat(e.target.value) || 0)}
                        error={errors.baseRent}
                        required
                    />
                    <FormField
                        label="NK-Vorauszahlung (€)"
                        type="number"
                        value={formData.additionalCostsAdvance}
                        onChange={e => updateField('additionalCostsAdvance', parseFloat(e.target.value) || 0)}
                    />
                    <FormField
                        label="Kaution (€)"
                        type="number"
                        value={formData.deposit}
                        onChange={e => updateField('deposit', parseFloat(e.target.value) || 0)}
                    />
                </div>

                <div className="form-row form-row--3">
                    <FormField
                        label="Fälligkeitstag"
                        type="number"
                        value={formData.rentDueDay}
                        onChange={e => updateField('rentDueDay', parseInt(e.target.value) || 1)}
                        min={1}
                        max={28}
                        error={errors.rentDueDay}
                    />
                    <SelectField
                        label="Zahlungsart"
                        value={formData.paymentMethod}
                        onChange={value => updateField('paymentMethod', value as PaymentMethod)}
                        options={paymentMethods}
                    />
                    <div style={{ paddingTop: '28px' }}>
                        <CheckboxField
                            label="Kaution bezahlt"
                            checked={formData.depositPaid}
                            onChange={checked => updateField('depositPaid', checked)}
                        />
                    </div>
                </div>
            </div>

            <style>{`
        .form-section {
          margin-bottom: var(--space-lg);
          padding-bottom: var(--space-lg);
          border-bottom: 1px solid var(--border-color);
        }
        .form-section:last-child {
          border-bottom: none;
          margin-bottom: 0;
          padding-bottom: 0;
        }
        .form-section__title {
          font-size: var(--font-size-sm);
          font-weight: var(--font-weight-semibold);
          color: var(--text-secondary);
          margin-bottom: var(--space-md);
        }
      `}</style>
        </Modal>
    )
}

export default TenantForm
