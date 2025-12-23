import type { Property, PropertyUnit } from './types/property'
import type { Tenant } from './types/tenant'
import type { Expense, ExpenseCategory, MeterReading } from './types/expense'
import type { BillingStatement } from './types/billing'
import type { MaintenanceTask } from './types/maintenance'
import type { AppSettings, FileFilter } from './types/export'

export interface ElectronAPI {
    properties: {
        getAll: () => Promise<Property[]>
        getById: (id: string) => Promise<Property | null>
        create: (data: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Property>
        update: (id: string, data: Partial<Property>) => Promise<Property>
        delete: (id: string) => Promise<void>
    }
    units: {
        getByProperty: (propertyId: string) => Promise<PropertyUnit[]>
        create: (data: Omit<PropertyUnit, 'id'>) => Promise<PropertyUnit>
        update: (id: string, data: Partial<PropertyUnit>) => Promise<PropertyUnit>
        delete: (id: string) => Promise<void>
    }
    tenants: {
        getAll: () => Promise<Tenant[]>
        getByProperty: (propertyId: string) => Promise<Tenant[]>
        getByUnit: (unitId: string) => Promise<Tenant | null>
        create: (data: Omit<Tenant, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Tenant>
        update: (id: string, data: Partial<Tenant>) => Promise<Tenant>
        delete: (id: string) => Promise<void>
    }
    expenses: {
        getByProperty: (propertyId: string, year?: number) => Promise<Expense[]>
        create: (data: Omit<Expense, 'id' | 'createdAt'>) => Promise<Expense>
        update: (id: string, data: Partial<Expense>) => Promise<Expense>
        delete: (id: string) => Promise<void>
        getCategories: () => Promise<ExpenseCategory[]>
        updateCategory: (id: string, data: Partial<ExpenseCategory>) => Promise<ExpenseCategory>
    }
    meters: {
        getByUnit: (unitId: string) => Promise<MeterReading[]>
        create: (data: Omit<MeterReading, 'id'>) => Promise<MeterReading>
        update: (id: string, data: Partial<MeterReading>) => Promise<MeterReading>
    }
    billing: {
        getHistory: (propertyId?: string) => Promise<BillingStatement[]>
        save: (statement: BillingStatement) => Promise<BillingStatement>
    }
    maintenance: {
        getAll: () => Promise<MaintenanceTask[]>
        getByProperty: (propertyId: string) => Promise<MaintenanceTask[]>
        create: (data: Omit<MaintenanceTask, 'id' | 'createdAt' | 'updatedAt'>) => Promise<MaintenanceTask>
        update: (id: string, data: Partial<MaintenanceTask>) => Promise<MaintenanceTask>
        delete: (id: string) => Promise<void>
    }
    export: {
        fullBackup: () => Promise<string | null>
        importBackup: (filePath: string) => Promise<void>
    }
    files: {
        selectFile: (filters?: FileFilter[]) => Promise<string | null>
        selectDirectory: () => Promise<string | null>
        openFile: (path: string) => Promise<void>
    }
    settings: {
        get: () => Promise<AppSettings>
        update: (data: Partial<AppSettings>) => Promise<AppSettings>
        clearAllData: () => Promise<void>
    }
    app: {
        getVersion: () => Promise<string>
    }
}

declare global {
    interface Window {
        electronAPI: ElectronAPI
    }
}

export { }
