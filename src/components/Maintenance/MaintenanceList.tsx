import { useEffect, useState } from 'react'
import { MaintenanceTask, Property } from '../../types'
import { Button, Modal, SelectField } from '../Shared'
import { FormField, TextareaField } from '../Shared/FormField'
import './Maintenance.css'

type MaintenanceCategory = MaintenanceTask['category']
type MaintenancePriority = MaintenanceTask['priority']
type MaintenanceStatus = MaintenanceTask['status']

function MaintenanceList() {
    const [tasks, setTasks] = useState<MaintenanceTask[]>([])
    const [properties, setProperties] = useState<Property[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [filter, setFilter] = useState<string>('all')

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            const [tasksData, propertiesData] = await Promise.all([
                window.electronAPI.maintenance.getAll(),
                window.electronAPI.properties.getAll()
            ])
            setTasks(tasksData)
            setProperties(propertiesData)
        } catch (error) {
            console.error('Failed to load data:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleTaskCreated = (newTask: MaintenanceTask) => {
        setTasks(prev => [...prev, newTask])
        setShowForm(false)
    }

    const getPropertyName = (propertyId: string) => {
        return properties.find(p => p.id === propertyId)?.name || 'Unbekannt'
    }

    const filteredTasks = tasks.filter(task => {
        if (filter === 'all') return true
        return task.status === filter
    })

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(value)
    }

    const getPriorityBadge = (priority: MaintenancePriority) => {
        switch (priority) {
            case 'urgent': return <span className="badge badge--danger">Dringend</span>
            case 'high': return <span className="badge badge--warning">Hoch</span>
            case 'medium': return <span className="badge badge--neutral">Mittel</span>
            case 'low': return <span className="badge badge--success">Niedrig</span>
        }
    }

    const getStatusLabel = (status: MaintenanceStatus) => {
        switch (status) {
            case 'planned': return 'Geplant'
            case 'in-progress': return 'In Arbeit'
            case 'completed': return 'Erledigt'
            case 'cancelled': return 'Abgebrochen'
        }
    }

    const getCategoryIcon = (category: MaintenanceCategory) => {
        switch (category) {
            case 'repair': return '🔧'
            case 'maintenance': return '🛠️'
            case 'renovation': return '🏗️'
            case 'emergency': return '🚨'
            case 'inspection': return '🔍'
        }
    }

    if (loading) {
        return <div className="loading"><div className="loading__spinner" /></div>
    }

    return (
        <div className="page">
            <div className="page__header">
                <h1 className="page__title">Instandhaltung</h1>
                <div className="page__actions">
                    <Button icon="+" onClick={() => setShowForm(true)} disabled={properties.length === 0}>
                        Neue Aufgabe
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <div className="maintenance-filters">
                <button className={`filter-tab ${filter === 'all' ? 'filter-tab--active' : ''}`} onClick={() => setFilter('all')}>
                    Alle ({tasks.length})
                </button>
                <button className={`filter-tab ${filter === 'planned' ? 'filter-tab--active' : ''}`} onClick={() => setFilter('planned')}>
                    Geplant
                </button>
                <button className={`filter-tab ${filter === 'in-progress' ? 'filter-tab--active' : ''}`} onClick={() => setFilter('in-progress')}>
                    In Arbeit
                </button>
                <button className={`filter-tab ${filter === 'completed' ? 'filter-tab--active' : ''}`} onClick={() => setFilter('completed')}>
                    Erledigt
                </button>
            </div>

            {/* Task List */}
            {filteredTasks.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state__icon">🔧</div>
                    <div className="empty-state__title">Keine Aufgaben</div>
                    <div className="empty-state__description">
                        {filter === 'all' ? 'Erstellen Sie Ihre erste Instandhaltungsaufgabe.' : 'Keine Aufgaben in dieser Kategorie.'}
                    </div>
                </div>
            ) : (
                <div className="maintenance-list">
                    {filteredTasks.map(task => (
                        <div key={task.id} className="maintenance-card card">
                            <div className="maintenance-card__header">
                                <div className="maintenance-card__icon">{getCategoryIcon(task.category)}</div>
                                <div className="maintenance-card__info">
                                    <h3 className="maintenance-card__title">{task.title}</h3>
                                    <p className="maintenance-card__property">{getPropertyName(task.propertyId)}</p>
                                </div>
                                {getPriorityBadge(task.priority)}
                            </div>
                            <p className="maintenance-card__description">{task.description}</p>
                            <div className="maintenance-card__footer">
                                <span className="maintenance-card__status">{getStatusLabel(task.status)}</span>
                                <div className="maintenance-card__meta">
                                    {task.estimatedCost && <span>Geschätzt: {formatCurrency(task.estimatedCost)}</span>}
                                    {task.actualCost && <span>Tatsächlich: {formatCurrency(task.actualCost)}</span>}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* New Task Form */}
            {showForm && (
                <MaintenanceForm properties={properties} onClose={() => setShowForm(false)} onSave={handleTaskCreated} />
            )}
        </div>
    )
}

interface MaintenanceFormProps {
    properties: Property[]
    onClose: () => void
    onSave: (task: MaintenanceTask) => void
}

function MaintenanceForm({ properties, onClose, onSave }: MaintenanceFormProps) {
    const [formData, setFormData] = useState({
        propertyId: properties[0]?.id || '',
        title: '',
        description: '',
        category: 'repair' as MaintenanceCategory,
        priority: 'medium' as MaintenancePriority,
        estimatedCost: 0
    })
    const [saving, setSaving] = useState(false)

    const handleSubmit = async () => {
        if (!formData.propertyId || !formData.title) return

        setSaving(true)
        try {
            const task = await window.electronAPI.maintenance.create({
                propertyId: formData.propertyId,
                title: formData.title,
                description: formData.description,
                category: formData.category,
                priority: formData.priority,
                status: 'planned',
                reportedDate: new Date().toISOString(),
                estimatedCost: formData.estimatedCost || undefined,
                costs: [],
                isRecoverable: false,
                isTaxDeductible: true,
                attachments: [],
                notes: ''
            })
            onSave(task)
        } catch (error) {
            console.error('Failed to create task:', error)
        } finally {
            setSaving(false)
        }
    }

    return (
        <Modal isOpen={true} onClose={onClose} title="Neue Instandhaltungsaufgabe" footer={
            <>
                <Button variant="secondary" onClick={onClose}>Abbrechen</Button>
                <Button onClick={handleSubmit} loading={saving}>Speichern</Button>
            </>
        }>
            <div className="form-row form-row--2">
                <SelectField label="Immobilie" value={formData.propertyId} onChange={value => setFormData(prev => ({ ...prev, propertyId: value }))} options={properties.map(p => ({ value: p.id, label: p.name }))} required />
                <SelectField label="Kategorie" value={formData.category} onChange={value => setFormData(prev => ({ ...prev, category: value as MaintenanceCategory }))} options={[
                    { value: 'repair', label: 'Reparatur' },
                    { value: 'maintenance', label: 'Wartung' },
                    { value: 'renovation', label: 'Renovierung' },
                    { value: 'emergency', label: 'Notfall' },
                    { value: 'inspection', label: 'Inspektion' }
                ]} />
            </div>
            <FormField label="Titel" value={formData.title} onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))} placeholder="z.B. Heizung reparieren" required />
            <TextareaField label="Beschreibung" value={formData.description} onChange={value => setFormData(prev => ({ ...prev, description: value }))} placeholder="Details zur Aufgabe..." />
            <div className="form-row form-row--2">
                <SelectField label="Priorität" value={formData.priority} onChange={value => setFormData(prev => ({ ...prev, priority: value as MaintenancePriority }))} options={[
                    { value: 'low', label: 'Niedrig' },
                    { value: 'medium', label: 'Mittel' },
                    { value: 'high', label: 'Hoch' },
                    { value: 'urgent', label: 'Dringend' }
                ]} />
                <FormField label="Geschätzte Kosten (€)" type="number" value={formData.estimatedCost} onChange={e => setFormData(prev => ({ ...prev, estimatedCost: parseFloat(e.target.value) || 0 }))} />
            </div>
        </Modal>
    )
}

export default MaintenanceList
