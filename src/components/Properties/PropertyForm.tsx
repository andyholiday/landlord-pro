import { useState } from 'react'
import { Property, HeatingType, PropertyType } from '../../types'
import { Modal, Button, SelectField } from '../Shared'
import { FormField } from '../Shared/FormField'
import './Properties.css'

interface PropertyFormProps {
    property?: Property
    onClose: () => void
    onSave: (property: Property) => void
}

const propertyTypes: { value: PropertyType; label: string }[] = [
    { value: 'apartment', label: 'Wohnung' },
    { value: 'house', label: 'Haus' },
    { value: 'multi-family', label: 'Mehrfamilienhaus' }
]

const heatingTypes: { value: HeatingType; label: string }[] = [
    { value: 'gas', label: 'Gas' },
    { value: 'oil', label: 'Öl' },
    { value: 'district', label: 'Fernwärme' },
    { value: 'heat-pump', label: 'Wärmepumpe' },
    { value: 'electric', label: 'Elektrisch' },
    { value: 'other', label: 'Sonstige' }
]

function PropertyForm({ property, onClose, onSave }: PropertyFormProps) {
    const isEditing = !!property

    const [formData, setFormData] = useState({
        type: property?.type || 'apartment' as PropertyType,
        name: property?.name || '',
        street: property?.address.street || '',
        houseNumber: property?.address.houseNumber || '',
        postalCode: property?.address.postalCode || '',
        city: property?.address.city || '',
        country: property?.address.country || 'Deutschland',
        yearBuilt: property?.buildingData.yearBuilt || new Date().getFullYear(),
        totalArea: property?.buildingData.totalArea || 0,
        floors: property?.buildingData.floors || 1,
        heatingType: property?.buildingData.heatingType || 'gas' as HeatingType,
        heatingSystem: property?.buildingData.heatingSystem || '',
        energyClass: property?.buildingData.energyClass || '',
        propertyTax: property?.annualCosts.propertyTax || 0,
        buildingInsurance: property?.annualCosts.buildingInsurance || 0,
        notes: property?.notes || ''
    })

    const [saving, setSaving] = useState(false)
    const [errors, setErrors] = useState<Record<string, string>>({})

    const updateField = <K extends keyof typeof formData>(field: K, value: typeof formData[K]) => {
        setFormData(prev => ({ ...prev, [field]: value }))
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }))
        }
    }

    const validate = () => {
        const newErrors: Record<string, string> = {}

        if (!formData.name.trim()) newErrors.name = 'Name ist erforderlich'
        if (!formData.street.trim()) newErrors.street = 'Straße ist erforderlich'
        if (!formData.houseNumber.trim()) newErrors.houseNumber = 'Hausnummer ist erforderlich'
        if (!formData.postalCode.trim()) newErrors.postalCode = 'PLZ ist erforderlich'
        if (!formData.city.trim()) newErrors.city = 'Stadt ist erforderlich'
        if (formData.totalArea <= 0) newErrors.totalArea = 'Fläche muss größer als 0 sein'
        if (formData.yearBuilt < 1800 || formData.yearBuilt > new Date().getFullYear() + 5) {
            newErrors.yearBuilt = 'Ungültiges Baujahr'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async () => {
        if (!validate()) return

        setSaving(true)
        try {
            const propertyData = {
                type: formData.type,
                name: formData.name,
                address: {
                    street: formData.street,
                    houseNumber: formData.houseNumber,
                    postalCode: formData.postalCode,
                    city: formData.city,
                    country: formData.country
                },
                buildingData: {
                    yearBuilt: formData.yearBuilt,
                    totalArea: formData.totalArea,
                    floors: formData.floors,
                    heatingType: formData.heatingType,
                    heatingSystem: formData.heatingSystem,
                    energyClass: formData.energyClass || undefined
                },
                annualCosts: {
                    propertyTax: formData.propertyTax,
                    buildingInsurance: formData.buildingInsurance
                },
                documents: property?.documents || [],
                notes: formData.notes
            }

            let savedProperty: Property
            if (isEditing && property) {
                savedProperty = await window.electronAPI.properties.update(property.id, propertyData)
            } else {
                savedProperty = await window.electronAPI.properties.create(propertyData as any)
            }

            onSave(savedProperty)
        } catch (error) {
            console.error('Failed to save property:', error)
        } finally {
            setSaving(false)
        }
    }

    return (
        <Modal
            isOpen={true}
            onClose={onClose}
            title={isEditing ? 'Immobilie bearbeiten' : 'Neue Immobilie'}
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
                <h3 className="form-section__title">Allgemein</h3>

                <div className="form-row form-row--2">
                    <SelectField
                        label="Immobilientyp"
                        value={formData.type}
                        onChange={value => updateField('type', value as PropertyType)}
                        options={propertyTypes}
                        required
                    />
                    <FormField
                        label="Bezeichnung"
                        value={formData.name}
                        onChange={e => updateField('name', e.target.value)}
                        placeholder="z.B. Musterstraße 5"
                        error={errors.name}
                        required
                    />
                </div>
            </div>

            <div className="form-section">
                <h3 className="form-section__title">Adresse</h3>

                <div className="form-row form-row--2">
                    <FormField
                        label="Straße"
                        value={formData.street}
                        onChange={e => updateField('street', e.target.value)}
                        error={errors.street}
                        required
                    />
                    <FormField
                        label="Hausnummer"
                        value={formData.houseNumber}
                        onChange={e => updateField('houseNumber', e.target.value)}
                        error={errors.houseNumber}
                        required
                    />
                </div>

                <div className="form-row form-row--3">
                    <FormField
                        label="PLZ"
                        value={formData.postalCode}
                        onChange={e => updateField('postalCode', e.target.value)}
                        error={errors.postalCode}
                        required
                    />
                    <FormField
                        label="Stadt"
                        value={formData.city}
                        onChange={e => updateField('city', e.target.value)}
                        error={errors.city}
                        required
                    />
                    <FormField
                        label="Land"
                        value={formData.country}
                        onChange={e => updateField('country', e.target.value)}
                    />
                </div>
            </div>

            <div className="form-section">
                <h3 className="form-section__title">Gebäudedaten</h3>

                <div className="form-row form-row--3">
                    <FormField
                        label="Baujahr"
                        type="number"
                        value={formData.yearBuilt}
                        onChange={e => updateField('yearBuilt', parseInt(e.target.value) || 0)}
                        error={errors.yearBuilt}
                        required
                    />
                    <FormField
                        label="Gesamtfläche (m²)"
                        type="number"
                        value={formData.totalArea}
                        onChange={e => updateField('totalArea', parseFloat(e.target.value) || 0)}
                        error={errors.totalArea}
                        required
                    />
                    <FormField
                        label="Etagen"
                        type="number"
                        value={formData.floors}
                        onChange={e => updateField('floors', parseInt(e.target.value) || 1)}
                        min={1}
                    />
                </div>

                <div className="form-row form-row--3">
                    <SelectField
                        label="Heizungsart"
                        value={formData.heatingType}
                        onChange={value => updateField('heatingType', value as HeatingType)}
                        options={heatingTypes}
                    />
                    <FormField
                        label="Heizsystem"
                        value={formData.heatingSystem}
                        onChange={e => updateField('heatingSystem', e.target.value)}
                        placeholder="z.B. Zentralheizung"
                    />
                    <FormField
                        label="Energieklasse"
                        value={formData.energyClass}
                        onChange={e => updateField('energyClass', e.target.value)}
                        placeholder="z.B. C"
                    />
                </div>
            </div>

            <div className="form-section">
                <h3 className="form-section__title">Jährliche Kosten</h3>

                <div className="form-row form-row--2">
                    <FormField
                        label="Grundsteuer (€/Jahr)"
                        type="number"
                        value={formData.propertyTax}
                        onChange={e => updateField('propertyTax', parseFloat(e.target.value) || 0)}
                    />
                    <FormField
                        label="Gebäudeversicherung (€/Jahr)"
                        type="number"
                        value={formData.buildingInsurance}
                        onChange={e => updateField('buildingInsurance', parseFloat(e.target.value) || 0)}
                    />
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

export default PropertyForm
