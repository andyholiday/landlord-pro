// Billing Types for Immobilien Manager

import { DistributionKey } from './expense';

export interface BillingStatement {
    id: string;
    propertyId: string;
    unitId: string;
    tenantId: string;

    billingPeriod: {
        year: number;
        startDate: string;
        endDate: string;
    };

    tenantPeriod: {
        startDate: string;
        endDate: string;
        daysInPeriod: number;
        totalDaysInYear: number;
    };

    items: BillingItem[];

    summary: {
        totalCosts: number;
        tenantShare: number;
        advancePayments: number;
        balance: number;
    };

    status: 'draft' | 'sent' | 'paid' | 'disputed';
    createdAt: string;
    sentAt?: string;
    dueDate?: string;
    paidAt?: string;
    pdfPath?: string;
}

export interface BillingItem {
    categoryId: string;
    categoryName: string;
    totalAmount: number;
    distributionKey: DistributionKey;

    calculation: {
        totalUnits: number;
        tenantUnits: number;
        percentage: number;
    };

    tenantAmount: number;
}

export type BillingStatus = BillingStatement['status'];
