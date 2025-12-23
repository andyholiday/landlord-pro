// Tenant Types for Immobilien Manager

export interface Tenant {
    id: string;
    unitId: string;
    propertyId: string;

    personalData: {
        salutation: 'mr' | 'mrs' | 'diverse';
        firstName: string;
        lastName: string;
        birthDate?: string;
        email?: string;
        phone?: string;
        mobile?: string;
    };

    additionalOccupants?: {
        name: string;
        birthDate?: string;
        relationship: string;
    }[];

    contract: {
        startDate: string;
        endDate?: string;
        baseRent: number;
        additionalCostsAdvance: number;
        deposit: number;
        depositPaid: boolean;
        depositBankAccount?: string;
        rentDueDay: number;
        paymentMethod: 'transfer' | 'direct-debit';
        notes?: string;
    };

    bankDetails?: {
        iban: string;
        bic?: string;
        accountHolder: string;
        directDebitMandate?: boolean;
    };

    correspondence: CorrespondenceEntry[];
    status: 'active' | 'notice-given' | 'moved-out';
    moveOutDate?: string;
    documents: TenantDocument[];
    createdAt: string;
    updatedAt: string;
}

export interface CorrespondenceEntry {
    id: string;
    date: string;
    type: 'email' | 'letter' | 'phone' | 'in-person';
    subject: string;
    content: string;
    attachments?: string[];
}

export interface TenantDocument {
    id: string;
    name: string;
    type: 'contract' | 'handover-protocol' | 'id-copy' | 'income-proof' | 'correspondence' | 'other';
    filePath: string;
    uploadedAt: string;
}

export type Salutation = Tenant['personalData']['salutation'];
export type TenantStatus = Tenant['status'];
export type PaymentMethod = Tenant['contract']['paymentMethod'];
export type CorrespondenceType = CorrespondenceEntry['type'];
export type TenantDocumentType = TenantDocument['type'];
