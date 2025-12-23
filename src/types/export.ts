// Export Types for Immobilien Manager

import { Property } from './property';
import { Tenant } from './tenant';
import { Expense, ExpenseCategory, MeterReading } from './expense';
import { BillingStatement } from './billing';
import { MaintenanceTask } from './maintenance';

export interface TaxExportData {
    year: number;
    exportDate: string;

    properties: {
        property: Property;

        income: {
            totalRent: number;
            rentByMonth: { month: number; amount: number }[];
        };

        expenses: {
            recoverable: number;
            nonRecoverable: number;
            maintenance: number;
            modernization: number;
            depreciation?: number;
            interestPayments?: number;
            byCategory: { category: string; amount: number }[];
        };

        profitLoss: number;
    }[];

    summary: {
        totalIncome: number;
        totalExpenses: number;
        totalProfitLoss: number;
    };
}

export interface AppSettings {
    landlord: {
        name: string;
        address: {
            street: string;
            houseNumber: string;
            postalCode: string;
            city: string;
        };
        phone?: string;
        email?: string;
        taxId?: string;
    };

    pdfTemplate: {
        logoPath?: string;
        footerText?: string;
        primaryColor?: string;
    };

    backup: {
        autoBackup: boolean;
        backupInterval: 'daily' | 'weekly' | 'monthly';
        lastBackupDate?: string;
        backupPath?: string;
    };

    dataDirectory: string;
}

export interface BackupData {
    version: string;
    exportDate: string;
    properties: Property[];
    tenants: Tenant[];
    expenses: Expense[];
    billingStatements: BillingStatement[];
    maintenanceTasks: MaintenanceTask[];
    meterReadings: MeterReading[];
    expenseCategories: ExpenseCategory[];
    settings: AppSettings;
}

export interface FileFilter {
    name: string;
    extensions: string[];
}

export interface UpdateInfo {
    version: string;
    releaseDate: string;
    releaseNotes?: string;
}
