import { contextBridge, ipcRenderer } from 'electron'
import type { Property, PropertyUnit } from '../src/types/property'
import type { Tenant } from '../src/types/tenant'
import type { Expense, ExpenseCategory, MeterReading } from '../src/types/expense'
import type { BillingStatement } from '../src/types/billing'
import type { MaintenanceTask } from '../src/types/maintenance'
import type { AppSettings, FileFilter } from '../src/types/export'

const electronAPI = {
    // Properties
    properties: {
        getAll: (): Promise<Property[]> => ipcRenderer.invoke('properties:getAll'),
        getById: (id: string): Promise<Property | null> => ipcRenderer.invoke('properties:getById', id),
        create: (data: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>): Promise<Property> =>
            ipcRenderer.invoke('properties:create', data),
        update: (id: string, data: Partial<Property>): Promise<Property> =>
            ipcRenderer.invoke('properties:update', id, data),
        delete: (id: string): Promise<void> => ipcRenderer.invoke('properties:delete', id)
    },

    // Units
    units: {
        getByProperty: (propertyId: string): Promise<PropertyUnit[]> =>
            ipcRenderer.invoke('units:getByProperty', propertyId),
        create: (data: Omit<PropertyUnit, 'id'>): Promise<PropertyUnit> =>
            ipcRenderer.invoke('units:create', data),
        update: (id: string, data: Partial<PropertyUnit>): Promise<PropertyUnit> =>
            ipcRenderer.invoke('units:update', id, data),
        delete: (id: string): Promise<void> => ipcRenderer.invoke('units:delete', id)
    },

    // Tenants
    tenants: {
        getAll: (): Promise<Tenant[]> => ipcRenderer.invoke('tenants:getAll'),
        getByProperty: (propertyId: string): Promise<Tenant[]> =>
            ipcRenderer.invoke('tenants:getByProperty', propertyId),
        getByUnit: (unitId: string): Promise<Tenant | null> =>
            ipcRenderer.invoke('tenants:getByUnit', unitId),
        create: (data: Omit<Tenant, 'id' | 'createdAt' | 'updatedAt'>): Promise<Tenant> =>
            ipcRenderer.invoke('tenants:create', data),
        update: (id: string, data: Partial<Tenant>): Promise<Tenant> =>
            ipcRenderer.invoke('tenants:update', id, data),
        delete: (id: string): Promise<void> => ipcRenderer.invoke('tenants:delete', id)
    },

    // Expenses
    expenses: {
        getByProperty: (propertyId: string, year?: number): Promise<Expense[]> =>
            ipcRenderer.invoke('expenses:getByProperty', propertyId, year),
        create: (data: Omit<Expense, 'id' | 'createdAt'>): Promise<Expense> =>
            ipcRenderer.invoke('expenses:create', data),
        update: (id: string, data: Partial<Expense>): Promise<Expense> =>
            ipcRenderer.invoke('expenses:update', id, data),
        delete: (id: string): Promise<void> => ipcRenderer.invoke('expenses:delete', id),
        getCategories: (): Promise<ExpenseCategory[]> => ipcRenderer.invoke('expenses:getCategories'),
        updateCategory: (id: string, data: Partial<ExpenseCategory>): Promise<ExpenseCategory> =>
            ipcRenderer.invoke('expenses:updateCategory', id, data)
    },

    // Meter Readings
    meters: {
        getByUnit: (unitId: string): Promise<MeterReading[]> =>
            ipcRenderer.invoke('meters:getByUnit', unitId),
        create: (data: Omit<MeterReading, 'id'>): Promise<MeterReading> =>
            ipcRenderer.invoke('meters:create', data),
        update: (id: string, data: Partial<MeterReading>): Promise<MeterReading> =>
            ipcRenderer.invoke('meters:update', id, data)
    },

    // Billing
    billing: {
        getHistory: (propertyId?: string): Promise<BillingStatement[]> =>
            ipcRenderer.invoke('billing:getHistory', propertyId),
        save: (statement: BillingStatement): Promise<BillingStatement> =>
            ipcRenderer.invoke('billing:save', statement)
    },

    // Maintenance
    maintenance: {
        getAll: (): Promise<MaintenanceTask[]> => ipcRenderer.invoke('maintenance:getAll'),
        getByProperty: (propertyId: string): Promise<MaintenanceTask[]> =>
            ipcRenderer.invoke('maintenance:getByProperty', propertyId),
        create: (data: Omit<MaintenanceTask, 'id' | 'createdAt' | 'updatedAt'>): Promise<MaintenanceTask> =>
            ipcRenderer.invoke('maintenance:create', data),
        update: (id: string, data: Partial<MaintenanceTask>): Promise<MaintenanceTask> =>
            ipcRenderer.invoke('maintenance:update', id, data),
        delete: (id: string): Promise<void> => ipcRenderer.invoke('maintenance:delete', id)
    },

    // Export
    export: {
        fullBackup: (): Promise<string | null> => ipcRenderer.invoke('export:fullBackup'),
        importBackup: (filePath: string): Promise<void> => ipcRenderer.invoke('export:importBackup', filePath)
    },

    // Files
    files: {
        selectFile: (filters?: FileFilter[]): Promise<string | null> =>
            ipcRenderer.invoke('files:selectFile', filters),
        selectDirectory: (): Promise<string | null> => ipcRenderer.invoke('files:selectDirectory'),
        openFile: (path: string): Promise<void> => ipcRenderer.invoke('files:openFile', path)
    },

    // Settings
    settings: {
        get: (): Promise<AppSettings> => ipcRenderer.invoke('settings:get'),
        update: (data: Partial<AppSettings>): Promise<AppSettings> =>
            ipcRenderer.invoke('settings:update', data),
        clearAllData: (): Promise<void> => ipcRenderer.invoke('settings:clearAllData')
    },

    // App
    app: {
        getVersion: (): Promise<string> => ipcRenderer.invoke('app:getVersion')
    }
}

contextBridge.exposeInMainWorld('electronAPI', electronAPI)

// TypeScript type declaration
declare global {
    interface Window {
        electronAPI: typeof electronAPI
    }
}
