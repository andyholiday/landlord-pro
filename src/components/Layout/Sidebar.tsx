import { NavLink, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import './Sidebar.css'

interface NavItem {
    path: string
    label: string
    icon: string
}

const mainNavItems: NavItem[] = [
    { path: '/', label: 'Dashboard', icon: '🏠' },
    { path: '/properties', label: 'Immobilien', icon: '🏢' },
    { path: '/tenants', label: 'Mieter', icon: '👥' },
]

const financeNavItems: NavItem[] = [
    { path: '/expenses', label: 'Nebenkosten', icon: '💰' },
    { path: '/billing', label: 'Abrechnung', icon: '📄' },
]

const managementNavItems: NavItem[] = [
    { path: '/maintenance', label: 'Instandhaltung', icon: '🔧' },
    { path: '/settings', label: 'Einstellungen', icon: '⚙️' },
]

function Sidebar() {
    const location = useLocation()
    const [version, setVersion] = useState('1.0.0')

    useEffect(() => {
        window.electronAPI?.app.getVersion().then(setVersion).catch(() => { })
    }, [])

    const isActive = (path: string) => {
        if (path === '/') return location.pathname === '/'
        return location.pathname.startsWith(path)
    }

    const renderNavItems = (items: NavItem[]) => (
        <>
            {items.map(item => (
                <NavLink
                    key={item.path}
                    to={item.path}
                    className={`sidebar__link ${isActive(item.path) ? 'sidebar__link--active' : ''}`}
                >
                    <span className="sidebar__link-icon">{item.icon}</span>
                    {item.label}
                </NavLink>
            ))}
        </>
    )

    return (
        <nav className="sidebar">
            <div className="sidebar__logo">
                <img src="/logo.png" alt="Landlord Pro" className="sidebar__logo-img" />
                <span className="sidebar__logo-text">Landlord Pro</span>
            </div>

            <div className="sidebar__nav">
                <div className="sidebar__section">
                    <div className="sidebar__section-title">Übersicht</div>
                    {renderNavItems(mainNavItems)}
                </div>

                <div className="sidebar__section">
                    <div className="sidebar__section-title">Finanzen</div>
                    {renderNavItems(financeNavItems)}
                </div>

                <div className="sidebar__section">
                    <div className="sidebar__section-title">Verwaltung</div>
                    {renderNavItems(managementNavItems)}
                </div>
            </div>

            <div className="sidebar__footer">
                <span className="sidebar__version">Version {version}</span>
            </div>
        </nav>
    )
}

export default Sidebar
