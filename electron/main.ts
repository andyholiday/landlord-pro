import { app, BrowserWindow, ipcMain, dialog, shell } from 'electron'
import { join } from 'path'
import Store from 'electron-store'
import { v4 as uuidv4 } from 'uuid'

// Sample Data IDs (fixed for relationships)
const PROP_MFH_ID = 'prop-mfh-001'
const PROP_HOUSE_ID = 'prop-house-001'
const PROP_APT_ID = 'prop-apt-001'
const UNIT_EG_L_ID = 'unit-eg-links'
const UNIT_EG_R_ID = 'unit-eg-rechts'
const UNIT_OG_L_ID = 'unit-og-links'
const UNIT_OG_R_ID = 'unit-og-rechts'
const TENANT_MUELLER_ID = 'tenant-mueller'
const TENANT_SCHMIDT_ID = 'tenant-schmidt'
const TENANT_WEBER_ID = 'tenant-weber'
const TENANT_FISCHER_ID = 'tenant-fischer'
const TENANT_BAUER_ID = 'tenant-bauer'
const CAT_HEATING_ID = 'cat-heating'
const CAT_WATER_ID = 'cat-water'
const CAT_WASTE_ID = 'cat-waste'
const CAT_CLEANING_ID = 'cat-cleaning'
const CAT_INSURANCE_ID = 'cat-insurance'
const CAT_TAX_ID = 'cat-tax'

// Initialize electron-store with sample data
const store = new Store({
    name: 'immobilien-manager-data',
    defaults: {
        properties: [
            {
                id: PROP_MFH_ID,
                type: 'multi-family',
                name: 'Musterstraße 15',
                address: { street: 'Musterstraße', houseNumber: '15', postalCode: '80331', city: 'München', country: 'Deutschland' },
                buildingData: { yearBuilt: 1985, lastRenovation: 2018, totalArea: 320, plotSize: 450, floors: 2, heatingType: 'gas', heatingSystem: 'Zentralheizung', energyClass: 'C' },
                units: [
                    { id: UNIT_EG_L_ID, propertyId: PROP_MFH_ID, name: 'EG Links', floor: 0, area: 75, rooms: 3, hasBalcony: false, hasGarden: true, parkingSpaces: 1, currentTenantId: TENANT_MUELLER_ID, baseRent: 850, additionalCostsAdvance: 180 },
                    { id: UNIT_EG_R_ID, propertyId: PROP_MFH_ID, name: 'EG Rechts', floor: 0, area: 80, rooms: 3, hasBalcony: false, hasGarden: true, parkingSpaces: 1, currentTenantId: TENANT_SCHMIDT_ID, baseRent: 900, additionalCostsAdvance: 190 },
                    { id: UNIT_OG_L_ID, propertyId: PROP_MFH_ID, name: '1. OG Links', floor: 1, area: 75, rooms: 3, hasBalcony: true, hasGarden: false, parkingSpaces: 0, currentTenantId: TENANT_WEBER_ID, baseRent: 820, additionalCostsAdvance: 175 },
                    { id: UNIT_OG_R_ID, propertyId: PROP_MFH_ID, name: '1. OG Rechts', floor: 1, area: 90, rooms: 4, hasBalcony: true, hasGarden: false, parkingSpaces: 1, currentTenantId: TENANT_FISCHER_ID, baseRent: 1050, additionalCostsAdvance: 210 }
                ],
                annualCosts: { propertyTax: 1850, buildingInsurance: 1200, liabilityInsurance: 180, management: 2400 },
                documents: [],
                notes: 'Gut gepflegtes Mehrfamilienhaus in zentraler Lage. Dach 2018 erneuert.',
                createdAt: '2023-01-15T10:00:00Z',
                updatedAt: '2024-06-01T14:30:00Z'
            },
            {
                id: PROP_HOUSE_ID,
                type: 'house',
                name: 'Gartenweg 8',
                address: { street: 'Gartenweg', houseNumber: '8', postalCode: '82031', city: 'Grünwald', country: 'Deutschland' },
                buildingData: { yearBuilt: 2005, totalArea: 145, plotSize: 680, floors: 2, heatingType: 'heat-pump', heatingSystem: 'Fußbodenheizung', energyClass: 'B' },
                annualCosts: { propertyTax: 890, buildingInsurance: 650 },
                documents: [],
                notes: 'Modernes Einfamilienhaus mit großem Garten. Aktuell vermietet an Familie Bauer.',
                createdAt: '2023-03-20T09:00:00Z',
                updatedAt: '2024-02-15T11:00:00Z'
            },
            {
                id: PROP_APT_ID,
                type: 'apartment',
                name: 'Stadtplatz 3/12',
                address: { street: 'Stadtplatz', houseNumber: '3', postalCode: '80333', city: 'München', country: 'Deutschland' },
                buildingData: { yearBuilt: 1998, totalArea: 62, floors: 1, heatingType: 'district', heatingSystem: 'Fernwärme', energyClass: 'D' },
                annualCosts: { propertyTax: 420, buildingInsurance: 280, management: 480 },
                documents: [],
                notes: 'ETW im 4. Stock mit Aufzug. Derzeit leer - Neuvermietung geplant.',
                createdAt: '2022-11-10T16:00:00Z',
                updatedAt: '2024-09-01T08:00:00Z'
            }
        ],
        tenants: [
            {
                id: TENANT_MUELLER_ID, unitId: UNIT_EG_L_ID, propertyId: PROP_MFH_ID,
                personalData: { salutation: 'mr', firstName: 'Thomas', lastName: 'Müller', birthDate: '1975-06-12', email: 'thomas.mueller@email.de', phone: '089 12345678', mobile: '0171 1234567' },
                additionalOccupants: [{ name: 'Sabine Müller', birthDate: '1978-03-22', relationship: 'Ehefrau' }, { name: 'Max Müller', birthDate: '2010-09-15', relationship: 'Sohn' }],
                contract: { startDate: '2019-04-01', baseRent: 850, additionalCostsAdvance: 180, deposit: 2550, depositPaid: true, depositBankAccount: 'DE89 3704 0044 0532 0130 00', rentDueDay: 1, paymentMethod: 'direct-debit' },
                bankDetails: { iban: 'DE89 3704 0044 0532 0130 00', bic: 'COBADEFFXXX', accountHolder: 'Thomas Müller', directDebitMandate: true },
                correspondence: [{ id: 'corr-1', date: '2024-01-15', type: 'email', subject: 'Nebenkostenabrechnung 2023', content: 'Sehr geehrter Herr Müller, anbei die Nebenkostenabrechnung für 2023...' }],
                status: 'active', documents: [], createdAt: '2019-03-15T10:00:00Z', updatedAt: '2024-01-15T14:00:00Z'
            },
            {
                id: TENANT_SCHMIDT_ID, unitId: UNIT_EG_R_ID, propertyId: PROP_MFH_ID,
                personalData: { salutation: 'mrs', firstName: 'Anna', lastName: 'Schmidt', birthDate: '1982-11-05', email: 'anna.schmidt@gmail.com', mobile: '0172 9876543' },
                contract: { startDate: '2021-07-01', baseRent: 900, additionalCostsAdvance: 190, deposit: 2700, depositPaid: true, rentDueDay: 3, paymentMethod: 'transfer' },
                correspondence: [],
                status: 'active', documents: [], createdAt: '2021-06-01T11:00:00Z', updatedAt: '2024-06-01T09:00:00Z'
            },
            {
                id: TENANT_WEBER_ID, unitId: UNIT_OG_L_ID, propertyId: PROP_MFH_ID,
                personalData: { salutation: 'mr', firstName: 'Klaus', lastName: 'Weber', birthDate: '1968-02-28', email: 'k.weber@web.de', phone: '089 87654321' },
                additionalOccupants: [{ name: 'Maria Weber', birthDate: '1970-07-14', relationship: 'Ehefrau' }],
                contract: { startDate: '2017-10-01', baseRent: 820, additionalCostsAdvance: 175, deposit: 2460, depositPaid: true, rentDueDay: 1, paymentMethod: 'transfer' },
                correspondence: [],
                status: 'active', documents: [], createdAt: '2017-09-01T10:00:00Z', updatedAt: '2023-10-01T10:00:00Z'
            },
            {
                id: TENANT_FISCHER_ID, unitId: UNIT_OG_R_ID, propertyId: PROP_MFH_ID,
                personalData: { salutation: 'mrs', firstName: 'Lisa', lastName: 'Fischer', birthDate: '1990-04-18', email: 'lisa.fischer@outlook.de', mobile: '0176 1122334' },
                additionalOccupants: [{ name: 'Tim Fischer', birthDate: '2018-12-03', relationship: 'Sohn' }],
                contract: { startDate: '2022-03-01', baseRent: 1050, additionalCostsAdvance: 210, deposit: 3150, depositPaid: true, rentDueDay: 1, paymentMethod: 'direct-debit' },
                correspondence: [],
                status: 'active', documents: [], createdAt: '2022-02-10T14:00:00Z', updatedAt: '2024-03-01T10:00:00Z'
            },
            {
                id: TENANT_BAUER_ID, unitId: PROP_HOUSE_ID, propertyId: PROP_HOUSE_ID,
                personalData: { salutation: 'mr', firstName: 'Michael', lastName: 'Bauer', birthDate: '1980-08-25', email: 'michael.bauer@firma.de', phone: '089 55667788', mobile: '0170 9988776' },
                additionalOccupants: [{ name: 'Christina Bauer', birthDate: '1983-01-30', relationship: 'Ehefrau' }, { name: 'Emma Bauer', birthDate: '2012-06-10', relationship: 'Tochter' }, { name: 'Felix Bauer', birthDate: '2015-03-22', relationship: 'Sohn' }],
                contract: { startDate: '2020-09-01', baseRent: 1800, additionalCostsAdvance: 280, deposit: 5400, depositPaid: true, rentDueDay: 1, paymentMethod: 'transfer' },
                correspondence: [],
                status: 'active', documents: [], createdAt: '2020-08-01T10:00:00Z', updatedAt: '2024-09-01T10:00:00Z'
            }
        ],
        expenses: [
            { id: 'exp-1', propertyId: PROP_MFH_ID, categoryId: CAT_HEATING_ID, billingPeriod: { year: 2024, startDate: '2024-01-01', endDate: '2024-12-31' }, amount: 4850, invoiceNumber: 'SW-2024-001', invoiceDate: '2024-02-15', paymentDate: '2024-03-01', vendor: 'Stadtwerke München', description: 'Gasabrechnung 2024' },
            { id: 'exp-2', propertyId: PROP_MFH_ID, categoryId: CAT_WATER_ID, billingPeriod: { year: 2024, startDate: '2024-01-01', endDate: '2024-12-31' }, amount: 1680, invoiceNumber: 'WW-2024-123', invoiceDate: '2024-03-10', paymentDate: '2024-03-25', vendor: 'Münchner Wasserwerke', description: 'Wasser/Abwasser 2024' },
            { id: 'exp-3', propertyId: PROP_MFH_ID, categoryId: CAT_WASTE_ID, billingPeriod: { year: 2024, startDate: '2024-01-01', endDate: '2024-12-31' }, amount: 920, invoiceNumber: 'AWM-2024-456', invoiceDate: '2024-01-20', paymentDate: '2024-02-05', vendor: 'AWM München', description: 'Müllgebühren 2024' },
            { id: 'exp-4', propertyId: PROP_MFH_ID, categoryId: CAT_CLEANING_ID, billingPeriod: { year: 2024, startDate: '2024-01-01', endDate: '2024-12-31' }, amount: 1440, invoiceNumber: 'HM-2024-12', invoiceDate: '2024-01-05', vendor: 'Hausmeisterservice Maier', description: 'Hausmeister + Treppenhausreinigung' },
            { id: 'exp-5', propertyId: PROP_MFH_ID, categoryId: CAT_INSURANCE_ID, billingPeriod: { year: 2024, startDate: '2024-01-01', endDate: '2024-12-31' }, amount: 1200, invoiceNumber: 'AXA-2024-789', invoiceDate: '2024-01-02', paymentDate: '2024-01-15', vendor: 'AXA Versicherung', description: 'Gebäudeversicherung 2024' },
            { id: 'exp-6', propertyId: PROP_MFH_ID, categoryId: CAT_TAX_ID, billingPeriod: { year: 2024, startDate: '2024-01-01', endDate: '2024-12-31' }, amount: 1850, invoiceNumber: 'FA-2024-GS', invoiceDate: '2024-02-01', paymentDate: '2024-02-28', vendor: 'Finanzamt München', description: 'Grundsteuer 2024' },
            { id: 'exp-7', propertyId: PROP_HOUSE_ID, categoryId: CAT_HEATING_ID, billingPeriod: { year: 2024, startDate: '2024-01-01', endDate: '2024-12-31' }, amount: 1450, invoiceNumber: 'SW-H-2024', invoiceDate: '2024-03-01', vendor: 'Stadtwerke Grünwald', description: 'Stromkosten Wärmepumpe 2024' },
            { id: 'exp-8', propertyId: PROP_HOUSE_ID, categoryId: CAT_WATER_ID, billingPeriod: { year: 2024, startDate: '2024-01-01', endDate: '2024-12-31' }, amount: 680, invoiceNumber: 'WW-H-2024', invoiceDate: '2024-03-15', vendor: 'Wasserwerk Grünwald', description: 'Wasser/Abwasser 2024' }
        ],
        billingStatements: [],
        maintenanceTasks: [
            { id: 'mt-1', propertyId: PROP_MFH_ID, unitId: UNIT_OG_R_ID, title: 'Wasserhahn tropft', description: 'Armatur im Bad tropft seit einer Woche. Dichtung vermutlich defekt.', category: 'repair', priority: 'medium', status: 'planned', reportedDate: '2024-12-20', plannedDate: '2024-12-28', estimatedCost: 80, costs: [], isRecoverable: false, isTaxDeductible: true, attachments: [], notes: 'Mieter Fischer hat am 20.12. gemeldet', createdAt: '2024-12-20T10:00:00Z', updatedAt: '2024-12-20T10:00:00Z' },
            { id: 'mt-2', propertyId: PROP_MFH_ID, title: 'Heizungswartung 2025', description: 'Jährliche Wartung der Gasheizung durch Fachbetrieb. Termin mit Heizungsbauer Müller vereinbaren.', category: 'maintenance', priority: 'medium', status: 'planned', reportedDate: '2024-12-01', plannedDate: '2025-01-15', estimatedCost: 350, costs: [], isRecoverable: false, isTaxDeductible: true, attachments: [], notes: 'Heizungsbauer: 089-12312312', createdAt: '2024-12-01T09:00:00Z', updatedAt: '2024-12-01T09:00:00Z' },
            { id: 'mt-3', propertyId: PROP_MFH_ID, title: 'Treppenhausbeleuchtung defekt', description: '2 LED-Leuchten im Treppenhaus ausgefallen (EG und 1.OG).', category: 'repair', priority: 'high', status: 'in-progress', reportedDate: '2024-12-15', estimatedCost: 120, actualCost: 95, costs: [{ id: 'cost-1', description: '2x LED-Röhre 120cm', amount: 45, type: 'material' }, { id: 'cost-2', description: 'Montage Elektriker', amount: 50, type: 'labor' }], contractor: { name: 'Elektro Schmidt', phone: '089-55544433', email: 'info@elektro-schmidt.de' }, isRecoverable: false, isTaxDeductible: true, attachments: [], notes: 'Elektriker kommt am 27.12.', createdAt: '2024-12-15T11:00:00Z', updatedAt: '2024-12-22T15:00:00Z' },
            { id: 'mt-4', propertyId: PROP_HOUSE_ID, title: 'Gartenpflege Frühjahr', description: 'Hecke schneiden, Rasen vertikutieren, Beete vorbereiten.', category: 'maintenance', priority: 'low', status: 'planned', reportedDate: '2024-12-01', plannedDate: '2025-03-15', estimatedCost: 280, costs: [], isRecoverable: true, isTaxDeductible: true, attachments: [], notes: '', createdAt: '2024-12-01T10:00:00Z', updatedAt: '2024-12-01T10:00:00Z' }
        ],
        meterReadings: [
            { id: 'mr-1', unitId: UNIT_EG_L_ID, meterType: 'heating', meterNumber: 'HM-EGL-001', readingDate: '2024-01-01', value: 12450, isEstimated: false },
            { id: 'mr-2', unitId: UNIT_EG_L_ID, meterType: 'cold-water', meterNumber: 'WM-EGL-001', readingDate: '2024-01-01', value: 245.6, isEstimated: false },
            { id: 'mr-3', unitId: UNIT_EG_R_ID, meterType: 'heating', meterNumber: 'HM-EGR-001', readingDate: '2024-01-01', value: 13200, isEstimated: false },
            { id: 'mr-4', unitId: UNIT_OG_L_ID, meterType: 'heating', meterNumber: 'HM-OGL-001', readingDate: '2024-01-01', value: 11800, isEstimated: false },
            { id: 'mr-5', unitId: UNIT_OG_R_ID, meterType: 'heating', meterNumber: 'HM-OGR-001', readingDate: '2024-01-01', value: 15600, isEstimated: false }
        ],
        expenseCategories: [
            { id: CAT_HEATING_ID, name: 'Heizkosten', type: 'heating', distributionKey: 'consumption', isRecoverable: true },
            { id: CAT_WATER_ID, name: 'Wasser/Abwasser', type: 'water', distributionKey: 'consumption', isRecoverable: true },
            { id: CAT_WASTE_ID, name: 'Müllabfuhr', type: 'waste', distributionKey: 'persons', isRecoverable: true },
            { id: CAT_CLEANING_ID, name: 'Hausmeister & Reinigung', type: 'cleaning', distributionKey: 'area', isRecoverable: true },
            { id: CAT_INSURANCE_ID, name: 'Gebäudeversicherung', type: 'insurance', distributionKey: 'area', isRecoverable: true },
            { id: CAT_TAX_ID, name: 'Grundsteuer', type: 'property-tax', distributionKey: 'area', isRecoverable: true },
            { id: 'cat-garden', name: 'Gartenpflege', type: 'garden', distributionKey: 'area', isRecoverable: true },
            { id: 'cat-lighting', name: 'Allgemeinstrom', type: 'lighting', distributionKey: 'units', isRecoverable: true },
            { id: 'cat-management', name: 'Hausverwaltung', type: 'management', distributionKey: 'units', isRecoverable: false }
        ],
        settings: {
            landlord: {
                name: 'Max Mustermann',
                address: { street: 'Vermieterstraße', houseNumber: '1', postalCode: '80331', city: 'München' },
                phone: '089 99887766',
                email: 'max.mustermann@vermieter.de',
                taxId: 'DE123456789'
            },
            pdfTemplate: { footerText: 'Max Mustermann Immobilien' },
            backup: { autoBackup: true, backupInterval: 'weekly' },
            dataDirectory: app.getPath('userData')
        }
    }
})

let mainWindow: BrowserWindow | null = null

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 1024,
        minHeight: 700,
        titleBarStyle: 'hiddenInset',
        trafficLightPosition: { x: 16, y: 16 },
        backgroundColor: '#1c1c1e',
        webPreferences: {
            preload: join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true
        }
    })

    // Load app
    if (process.env.VITE_DEV_SERVER_URL) {
        mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
        mainWindow.webContents.openDevTools()
    } else {
        mainWindow.loadFile(join(__dirname, '../dist/index.html'))
    }

    mainWindow.on('closed', () => {
        mainWindow = null
    })
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow()
    }
})

// ==================== IPC Handlers ====================

// Properties
ipcMain.handle('properties:getAll', () => {
    return store.get('properties', [])
})

ipcMain.handle('properties:getById', (_, id: string) => {
    const properties = store.get('properties', []) as any[]
    return properties.find(p => p.id === id) || null
})

ipcMain.handle('properties:create', (_, data) => {
    const properties = store.get('properties', []) as any[]
    const now = new Date().toISOString()
    const newProperty = {
        ...data,
        id: uuidv4(),
        createdAt: now,
        updatedAt: now
    }
    properties.push(newProperty)
    store.set('properties', properties)
    return newProperty
})

ipcMain.handle('properties:update', (_, id: string, data) => {
    const properties = store.get('properties', []) as any[]
    const index = properties.findIndex(p => p.id === id)
    if (index === -1) throw new Error('Property not found')

    properties[index] = {
        ...properties[index],
        ...data,
        updatedAt: new Date().toISOString()
    }
    store.set('properties', properties)
    return properties[index]
})

ipcMain.handle('properties:delete', (_, id: string) => {
    const properties = store.get('properties', []) as any[]
    store.set('properties', properties.filter(p => p.id !== id))
})

// Units
ipcMain.handle('units:getByProperty', (_, propertyId: string) => {
    const properties = store.get('properties', []) as any[]
    const property = properties.find(p => p.id === propertyId)
    return property?.units || []
})

ipcMain.handle('units:create', (_, data) => {
    const properties = store.get('properties', []) as any[]
    const propertyIndex = properties.findIndex(p => p.id === data.propertyId)
    if (propertyIndex === -1) throw new Error('Property not found')

    const newUnit = { ...data, id: uuidv4() }
    if (!properties[propertyIndex].units) {
        properties[propertyIndex].units = []
    }
    properties[propertyIndex].units.push(newUnit)
    properties[propertyIndex].updatedAt = new Date().toISOString()
    store.set('properties', properties)
    return newUnit
})

ipcMain.handle('units:update', (_, id: string, data) => {
    const properties = store.get('properties', []) as any[]
    for (const property of properties) {
        if (property.units) {
            const unitIndex = property.units.findIndex((u: any) => u.id === id)
            if (unitIndex !== -1) {
                property.units[unitIndex] = { ...property.units[unitIndex], ...data }
                property.updatedAt = new Date().toISOString()
                store.set('properties', properties)
                return property.units[unitIndex]
            }
        }
    }
    throw new Error('Unit not found')
})

ipcMain.handle('units:delete', (_, id: string) => {
    const properties = store.get('properties', []) as any[]
    for (const property of properties) {
        if (property.units) {
            const unitIndex = property.units.findIndex((u: any) => u.id === id)
            if (unitIndex !== -1) {
                property.units.splice(unitIndex, 1)
                property.updatedAt = new Date().toISOString()
                store.set('properties', properties)
                return
            }
        }
    }
})

// Tenants
ipcMain.handle('tenants:getAll', () => {
    return store.get('tenants', [])
})

ipcMain.handle('tenants:getByProperty', (_, propertyId: string) => {
    const tenants = store.get('tenants', []) as any[]
    return tenants.filter(t => t.propertyId === propertyId)
})

ipcMain.handle('tenants:getByUnit', (_, unitId: string) => {
    const tenants = store.get('tenants', []) as any[]
    return tenants.find(t => t.unitId === unitId && t.status === 'active') || null
})

ipcMain.handle('tenants:create', (_, data) => {
    const tenants = store.get('tenants', []) as any[]
    const now = new Date().toISOString()
    const newTenant = {
        ...data,
        id: uuidv4(),
        createdAt: now,
        updatedAt: now
    }
    tenants.push(newTenant)
    store.set('tenants', tenants)
    return newTenant
})

ipcMain.handle('tenants:update', (_, id: string, data) => {
    const tenants = store.get('tenants', []) as any[]
    const index = tenants.findIndex(t => t.id === id)
    if (index === -1) throw new Error('Tenant not found')

    tenants[index] = {
        ...tenants[index],
        ...data,
        updatedAt: new Date().toISOString()
    }
    store.set('tenants', tenants)
    return tenants[index]
})

ipcMain.handle('tenants:delete', (_, id: string) => {
    const tenants = store.get('tenants', []) as any[]
    store.set('tenants', tenants.filter(t => t.id !== id))
})

// Expenses
ipcMain.handle('expenses:getByProperty', (_, propertyId: string, year?: number) => {
    const expenses = store.get('expenses', []) as any[]
    return expenses.filter(e => {
        if (e.propertyId !== propertyId) return false
        if (year && e.billingPeriod?.year !== year) return false
        return true
    })
})

ipcMain.handle('expenses:create', (_, data) => {
    const expenses = store.get('expenses', []) as any[]
    const newExpense = {
        ...data,
        id: uuidv4(),
        createdAt: new Date().toISOString()
    }
    expenses.push(newExpense)
    store.set('expenses', expenses)
    return newExpense
})

ipcMain.handle('expenses:update', (_, id: string, data) => {
    const expenses = store.get('expenses', []) as any[]
    const index = expenses.findIndex(e => e.id === id)
    if (index === -1) throw new Error('Expense not found')

    expenses[index] = { ...expenses[index], ...data }
    store.set('expenses', expenses)
    return expenses[index]
})

ipcMain.handle('expenses:delete', (_, id: string) => {
    const expenses = store.get('expenses', []) as any[]
    store.set('expenses', expenses.filter(e => e.id !== id))
})

ipcMain.handle('expenses:getCategories', () => {
    return store.get('expenseCategories', [])
})

ipcMain.handle('expenses:updateCategory', (_, id: string, data) => {
    const categories = store.get('expenseCategories', []) as any[]
    const index = categories.findIndex(c => c.id === id)
    if (index === -1) throw new Error('Category not found')

    categories[index] = { ...categories[index], ...data }
    store.set('expenseCategories', categories)
    return categories[index]
})

// Meter Readings
ipcMain.handle('meters:getByUnit', (_, unitId: string) => {
    const readings = store.get('meterReadings', []) as any[]
    return readings.filter(r => r.unitId === unitId)
})

ipcMain.handle('meters:create', (_, data) => {
    const readings = store.get('meterReadings', []) as any[]
    const newReading = { ...data, id: uuidv4() }
    readings.push(newReading)
    store.set('meterReadings', readings)
    return newReading
})

ipcMain.handle('meters:update', (_, id: string, data) => {
    const readings = store.get('meterReadings', []) as any[]
    const index = readings.findIndex(r => r.id === id)
    if (index === -1) throw new Error('Meter reading not found')

    readings[index] = { ...readings[index], ...data }
    store.set('meterReadings', readings)
    return readings[index]
})

// Billing
ipcMain.handle('billing:getHistory', (_, propertyId?: string) => {
    const statements = store.get('billingStatements', []) as any[]
    if (propertyId) {
        return statements.filter(s => s.propertyId === propertyId)
    }
    return statements
})

ipcMain.handle('billing:save', (_, statement) => {
    const statements = store.get('billingStatements', []) as any[]
    const existingIndex = statements.findIndex(s => s.id === statement.id)

    if (existingIndex !== -1) {
        statements[existingIndex] = statement
    } else {
        statements.push({ ...statement, id: statement.id || uuidv4() })
    }
    store.set('billingStatements', statements)
    return statement
})

// Maintenance
ipcMain.handle('maintenance:getAll', () => {
    return store.get('maintenanceTasks', [])
})

ipcMain.handle('maintenance:getByProperty', (_, propertyId: string) => {
    const tasks = store.get('maintenanceTasks', []) as any[]
    return tasks.filter(t => t.propertyId === propertyId)
})

ipcMain.handle('maintenance:create', (_, data) => {
    const tasks = store.get('maintenanceTasks', []) as any[]
    const now = new Date().toISOString()
    const newTask = {
        ...data,
        id: uuidv4(),
        createdAt: now,
        updatedAt: now
    }
    tasks.push(newTask)
    store.set('maintenanceTasks', tasks)
    return newTask
})

ipcMain.handle('maintenance:update', (_, id: string, data) => {
    const tasks = store.get('maintenanceTasks', []) as any[]
    const index = tasks.findIndex(t => t.id === id)
    if (index === -1) throw new Error('Task not found')

    tasks[index] = {
        ...tasks[index],
        ...data,
        updatedAt: new Date().toISOString()
    }
    store.set('maintenanceTasks', tasks)
    return tasks[index]
})

ipcMain.handle('maintenance:delete', (_, id: string) => {
    const tasks = store.get('maintenanceTasks', []) as any[]
    store.set('maintenanceTasks', tasks.filter(t => t.id !== id))
})

// Settings
ipcMain.handle('settings:get', () => {
    return store.get('settings', {})
})

ipcMain.handle('settings:update', (_, data) => {
    const settings = store.get('settings', {}) as any
    const updatedSettings = { ...settings, ...data }
    store.set('settings', updatedSettings)
    return updatedSettings
})

ipcMain.handle('settings:clearAllData', () => {
    store.set('properties', [])
    store.set('tenants', [])
    store.set('expenses', [])
    store.set('billingStatements', [])
    store.set('maintenanceTasks', [])
    store.set('meterReadings', [])
})

// File Operations
ipcMain.handle('files:selectFile', async (_, filters) => {
    const result = await dialog.showOpenDialog({
        properties: ['openFile'],
        filters: filters || [{ name: 'All Files', extensions: ['*'] }]
    })
    return result.canceled ? null : result.filePaths[0]
})

ipcMain.handle('files:selectDirectory', async () => {
    const result = await dialog.showOpenDialog({
        properties: ['openDirectory']
    })
    return result.canceled ? null : result.filePaths[0]
})

ipcMain.handle('files:openFile', async (_, path: string) => {
    await shell.openPath(path)
})

// App Info
ipcMain.handle('app:getVersion', () => {
    return app.getVersion()
})

// Export/Backup
ipcMain.handle('export:fullBackup', async () => {
    const data = {
        version: app.getVersion(),
        exportDate: new Date().toISOString(),
        properties: store.get('properties', []),
        tenants: store.get('tenants', []),
        expenses: store.get('expenses', []),
        billingStatements: store.get('billingStatements', []),
        maintenanceTasks: store.get('maintenanceTasks', []),
        meterReadings: store.get('meterReadings', []),
        expenseCategories: store.get('expenseCategories', []),
        settings: store.get('settings', {})
    }

    const result = await dialog.showSaveDialog({
        defaultPath: `immobilien-backup-${new Date().toISOString().split('T')[0]}.json`,
        filters: [{ name: 'JSON', extensions: ['json'] }]
    })

    if (!result.canceled && result.filePath) {
        const fs = await import('fs/promises')
        await fs.writeFile(result.filePath, JSON.stringify(data, null, 2))
        return result.filePath
    }
    return null
})

ipcMain.handle('export:importBackup', async (_, filePath: string) => {
    const fs = await import('fs/promises')
    const content = await fs.readFile(filePath, 'utf-8')
    const data = JSON.parse(content)

    if (data.properties) store.set('properties', data.properties)
    if (data.tenants) store.set('tenants', data.tenants)
    if (data.expenses) store.set('expenses', data.expenses)
    if (data.billingStatements) store.set('billingStatements', data.billingStatements)
    if (data.maintenanceTasks) store.set('maintenanceTasks', data.maintenanceTasks)
    if (data.meterReadings) store.set('meterReadings', data.meterReadings)
    if (data.expenseCategories) store.set('expenseCategories', data.expenseCategories)
    if (data.settings) store.set('settings', data.settings)
})
