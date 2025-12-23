// Property Types for Immobilien Manager

export interface Property {
    id: string;
    type: 'apartment' | 'house' | 'multi-family';
    name: string;

    address: {
        street: string;
        houseNumber: string;
        postalCode: string;
        city: string;
        country: string;
    };

    buildingData: {
        yearBuilt: number;
        lastRenovation?: number;
        totalArea: number;
        plotSize?: number;
        floors: number;
        heatingType: 'gas' | 'oil' | 'district' | 'heat-pump' | 'electric' | 'other';
        heatingSystem: string;
        energyClass?: string;
    };

    units?: PropertyUnit[];

    purchaseData?: {
        purchaseDate: string;
        purchasePrice: number;
        notaryFees: number;
        agentFees: number;
        landTransferTax: number;
    };

    annualCosts: {
        propertyTax: number;
        buildingInsurance: number;
        liabilityInsurance?: number;
        management?: number;
    };

    documents: PropertyDocument[];
    notes: string;
    createdAt: string;
    updatedAt: string;
}

export interface PropertyUnit {
    id: string;
    propertyId: string;
    name: string;
    floor: number;
    area: number;
    rooms: number;
    hasBalcony: boolean;
    hasGarden: boolean;
    parkingSpaces: number;
    currentTenantId?: string;
    baseRent: number;
    additionalCostsAdvance: number;
}

export interface PropertyDocument {
    id: string;
    name: string;
    type: 'purchase-contract' | 'floor-plan' | 'energy-certificate' | 'insurance' | 'other';
    filePath: string;
    uploadedAt: string;
}

export type PropertyType = Property['type'];
export type HeatingType = Property['buildingData']['heatingType'];
export type DocumentType = PropertyDocument['type'];
