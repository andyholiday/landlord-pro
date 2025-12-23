import { useLocation } from 'react-router-dom'
import './Header.css'

const routeTitles: Record<string, string> = {
    '/': 'Dashboard',
    '/properties': 'Immobilien',
    '/tenants': 'Mieter',
    '/expenses': 'Nebenkosten',
    '/billing': 'Abrechnung',
    '/billing/new': 'Neue Abrechnung',
    '/maintenance': 'Instandhaltung',
    '/export': 'Export',
}

function Header() {
    const location = useLocation()

    const getBreadcrumb = () => {
        const path = location.pathname

        // Check for detail pages (e.g., /properties/123)
        if (path.match(/^\/properties\/[^/]+$/)) {
            return [
                { label: 'Immobilien', path: '/properties' },
                { label: 'Details', path: path, current: true }
            ]
        }
        if (path.match(/^\/tenants\/[^/]+$/)) {
            return [
                { label: 'Mieter', path: '/tenants' },
                { label: 'Details', path: path, current: true }
            ]
        }
        if (path === '/billing/new') {
            return [
                { label: 'Abrechnung', path: '/billing' },
                { label: 'Neue Abrechnung', path: path, current: true }
            ]
        }

        const title = routeTitles[path] || 'Seite'
        return [{ label: title, path: path, current: true }]
    }

    const breadcrumb = getBreadcrumb()

    return (
        <div className="header">
            <nav className="header__breadcrumb">
                {breadcrumb.map((item, index) => (
                    <span key={item.path}>
                        {index > 0 && <span className="header__breadcrumb-separator">/</span>}
                        <span className={`header__breadcrumb-item ${item.current ? 'header__breadcrumb-item--current' : ''}`}>
                            {item.label}
                        </span>
                    </span>
                ))}
            </nav>

            <div className="header__search">
                <span className="header__search-icon">🔍</span>
                <input
                    type="text"
                    className="header__search-input"
                    placeholder="Suchen..."
                />
            </div>

            <div className="header__actions">
                {/* Future: Quick actions, notifications */}
            </div>
        </div>
    )
}

export default Header
