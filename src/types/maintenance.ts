// Maintenance Types for Immobilien Manager

export interface MaintenanceTask {
    id: string;
    propertyId: string;
    unitId?: string;

    title: string;
    description: string;
    category: 'repair' | 'maintenance' | 'renovation' | 'emergency' | 'inspection';
    priority: 'low' | 'medium' | 'high' | 'urgent';

    status: 'planned' | 'in-progress' | 'completed' | 'cancelled';

    reportedDate: string;
    plannedDate?: string;
    completedDate?: string;

    estimatedCost?: number;
    actualCost?: number;
    costs: MaintenanceCost[];

    contractor?: {
        name: string;
        phone?: string;
        email?: string;
    };

    isRecoverable: boolean;
    isTaxDeductible: boolean;
    taxCategory?: 'maintenance' | 'modernization';

    attachments: MaintenanceAttachment[];
    notes: string;
    createdAt: string;
    updatedAt: string;
}

export interface MaintenanceCost {
    id: string;
    description: string;
    amount: number;
    type: 'material' | 'labor' | 'other';
    invoiceNumber?: string;
    invoiceDate?: string;
    documentPath?: string;
}

export interface MaintenanceAttachment {
    id: string;
    name: string;
    type: 'photo' | 'invoice' | 'quote' | 'report' | 'other';
    filePath: string;
    uploadedAt: string;
}

export type MaintenanceCategory = MaintenanceTask['category'];
export type MaintenancePriority = MaintenanceTask['priority'];
export type MaintenanceStatus = MaintenanceTask['status'];
export type MaintenanceCostType = MaintenanceCost['type'];
export type MaintenanceAttachmentType = MaintenanceAttachment['type'];
