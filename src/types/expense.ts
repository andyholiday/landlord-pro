// Expense Types for Immobilien Manager

export interface ExpenseCategory {
    id: string;
    name: string;
    type: 'heating' | 'water' | 'waste' | 'cleaning' | 'garden' | 'insurance' | 'property-tax' | 'management' | 'elevator' | 'lighting' | 'other';
    distributionKey: DistributionKey;
    isRecoverable: boolean;
}

export type DistributionKey =
    | 'area'
    | 'units'
    | 'persons'
    | 'consumption'
    | 'fixed';

export interface Expense {
    id: string;
    propertyId: string;
    categoryId: string;

    billingPeriod: {
        year: number;
        startDate: string;
        endDate: string;
    };

    amount: number;
    invoiceNumber?: string;
    invoiceDate: string;
    paymentDate?: string;
    vendor: string;
    description?: string;

    consumption?: {
        totalConsumption: number;
        unit: 'kWh' | 'm³' | 'units';
    };

    documentPath?: string;
    createdAt: string;
}

export interface MeterReading {
    id: string;
    unitId: string;
    meterType: 'heating' | 'hot-water' | 'cold-water' | 'electricity' | 'gas';
    meterNumber: string;
    readingDate: string;
    value: number;
    isEstimated: boolean;
    notes?: string;
}

export type ExpenseCategoryType = ExpenseCategory['type'];
export type MeterType = MeterReading['meterType'];
export type ConsumptionUnit = NonNullable<Expense['consumption']>['unit'];
