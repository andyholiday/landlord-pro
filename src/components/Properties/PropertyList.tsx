import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Property } from '../../types'
import { Button } from '../Shared'
import PropertyForm from './PropertyForm'
import './Properties.css'

function PropertyList() {
    const [properties, setProperties] = useState<Property[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [filter, setFilter] = useState<string>('all')
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        loadProperties()
    }, [])

    const loadProperties = async () => {
        try {
            const data = await window.electronAPI.properties.getAll()
            setProperties(data)
        } catch (error) {
            console.error('Failed to load properties:', error)
        } finally {
            setLoading(false)
        }
    }

    const handlePropertyCreated = (newProperty: Property) => {
        setProperties(prev => [...prev, newProperty])
        setShowForm(false)
    }

    const filteredProperties = properties.filter(property => {
        // Type filter
        if (filter !== 'all' && property.type !== filter) return false

        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            const searchableText = `${property.name} ${property.address.street} ${property.address.city}`.toLowerCase()
            if (!searchableText.includes(query)) return false
        }

        return true
    })

    const getPropertyIcon = (type: Property['type']) => {
        switch (type) {
            case 'apartment': return '🏢'
            case 'house': return '🏠'
            case 'multi-family': return '🏘️'
        }
    }

    const getPropertyTypeLabel = (type: Property['type']) => {
        switch (type) {
            case 'apartment': return 'Wohnung'
            case 'house': return 'Haus'
            case 'multi-family': return 'Mehrfamilienhaus'
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
                <h1 className="page__title">Immobilien</h1>
                <div className="page__actions">
                    <Button icon="+" onClick={() => setShowForm(true)}>
                        Neue Immobilie
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <div className="property-filters">
                <div className="property-filters__search">
                    <input
                        type="text"
                        placeholder="Suchen..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="form-input"
                    />
                </div>
                <div className="property-filters__tabs">
                    <button
                        className={`filter-tab ${filter === 'all' ? 'filter-tab--active' : ''}`}
                        onClick={() => setFilter('all')}
                    >
                        Alle ({properties.length})
                    </button>
                    <button
                        className={`filter-tab ${filter === 'apartment' ? 'filter-tab--active' : ''}`}
                        onClick={() => setFilter('apartment')}
                    >
                        Wohnungen
                    </button>
                    <button
                        className={`filter-tab ${filter === 'house' ? 'filter-tab--active' : ''}`}
                        onClick={() => setFilter('house')}
                    >
                        Häuser
                    </button>
                    <button
                        className={`filter-tab ${filter === 'multi-family' ? 'filter-tab--active' : ''}`}
                        onClick={() => setFilter('multi-family')}
                    >
                        Mehrfamilienhäuser
                    </button>
                </div>
            </div>

            {/* Property Grid */}
            {filteredProperties.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state__icon">🏠</div>
                    <div className="empty-state__title">
                        {properties.length === 0 ? 'Noch keine Immobilien' : 'Keine Treffer'}
                    </div>
                    <div className="empty-state__description">
                        {properties.length === 0
                            ? 'Fügen Sie Ihre erste Immobilie hinzu, um loszulegen.'
                            : 'Versuchen Sie einen anderen Suchbegriff oder Filter.'}
                    </div>
                </div>
            ) : (
                <div className="grid grid--auto">
                    {filteredProperties.map(property => (
                        <Link key={property.id} to={`/properties/${property.id}`} className="property-card card card--hover">
                            <div className="property-card__header">
                                <span className="property-card__icon">{getPropertyIcon(property.type)}</span>
                                <span className="property-card__type">{getPropertyTypeLabel(property.type)}</span>
                            </div>
                            <h3 className="property-card__name">{property.name}</h3>
                            <p className="property-card__address">
                                {property.address.street} {property.address.houseNumber}<br />
                                {property.address.postalCode} {property.address.city}
                            </p>
                            <div className="property-card__stats">
                                <span>{property.buildingData.totalArea} m²</span>
                                <span>•</span>
                                <span>Baujahr {property.buildingData.yearBuilt}</span>
                                {property.units && property.units.length > 0 && (
                                    <>
                                        <span>•</span>
                                        <span>{property.units.length} Einheiten</span>
                                    </>
                                )}
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            {/* New Property Form Modal */}
            {showForm && (
                <PropertyForm
                    onClose={() => setShowForm(false)}
                    onSave={handlePropertyCreated}
                />
            )}
        </div>
    )
}

export default PropertyList
