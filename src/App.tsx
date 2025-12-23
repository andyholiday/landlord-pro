import { Routes, Route } from 'react-router-dom'
import Sidebar from './components/Layout/Sidebar'
import Header from './components/Layout/Header'
import Dashboard from './components/Dashboard/Dashboard'
import PropertyList from './components/Properties/PropertyList'
import PropertyDetail from './components/Properties/PropertyDetail'
import TenantList from './components/Tenants/TenantList'
import TenantDetail from './components/Tenants/TenantDetail'
import ExpenseOverview from './components/Expenses/ExpenseOverview'
import BillingWizard from './components/Billing/BillingWizard'
import BillingHistory from './components/Billing/BillingHistory'
import MaintenanceList from './components/Maintenance/MaintenanceList'
import Settings from './components/Settings/Settings'

function App() {
    return (
        <div className="app">
            <aside className="app__sidebar">
                <Sidebar />
            </aside>
            <main className="app__main">
                <header className="app__header">
                    <Header />
                </header>
                <div className="app__content">
                    <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/properties" element={<PropertyList />} />
                        <Route path="/properties/:id" element={<PropertyDetail />} />
                        <Route path="/tenants" element={<TenantList />} />
                        <Route path="/tenants/:id" element={<TenantDetail />} />
                        <Route path="/expenses" element={<ExpenseOverview />} />
                        <Route path="/billing" element={<BillingHistory />} />
                        <Route path="/billing/new" element={<BillingWizard />} />
                        <Route path="/maintenance" element={<MaintenanceList />} />
                        <Route path="/settings" element={<Settings />} />
                    </Routes>
                </div>
            </main>
        </div>
    )
}

export default App
