# Immobilien Manager – Mac App Entwicklungs-Prompt

> Erstelle eine macOS Desktop-App zur Verwaltung und Abrechnung von Mietimmobilien nach den angehängten Coding Standards (Electron Mac App Blueprint + Global Coding Standards).

---

## 🎯 Projektziel

Eine professionelle Electron-basierte Mac-App für Privatvermieter zur:
- Verwaltung mehrerer Immobilien (Wohnungen, Einfamilienhäuser, Mehrfamilienhäuser)
- Mieterverwaltung mit vollständigen Stammdaten
- Automatisierten Nebenkostenabrechnung
- Tracking von Instandhaltungen und Reparaturen
- Steuerberater-gerechten Datenexport

---

## 🏗️ Tech-Stack (gemäß Coding Standards)

| Technologie | Zweck |
|-------------|-------|
| Electron 33+ | Desktop Framework |
| React 18 | UI Framework |
| TypeScript 5 (strict) | Type Safety |
| Vite 6 + electron-vite | Build Tool |
| electron-store | Lokale Datenspeicherung (JSON) |
| electron-builder | App Packaging (DMG) |
| electron-updater | Auto-Updates |
| date-fns | Datumsberechnungen |
| jsPDF + jspdf-autotable | PDF-Generierung |
| papaparse | CSV-Export |
| zod | Input-Validierung |

---

## 📁 Projektstruktur

```
immobilien-manager/
├── electron/
│   ├── main.ts
│   ├── preload.ts
│   └── services/
│       ├── StorageService.ts      # electron-store Wrapper
│       ├── PropertyService.ts     # Immobilien CRUD
│       ├── TenantService.ts       # Mieter CRUD
│       ├── ExpenseService.ts      # Nebenkosten
│       ├── MaintenanceService.ts  # Instandhaltung
│       ├── BillingService.ts      # Abrechnungslogik
│       ├── ExportService.ts       # PDF/CSV/Steuer-Export
│       └── BackupService.ts       # Datensicherung
│
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── App.css
│   │
│   ├── components/
│   │   ├── Layout/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Sidebar.css
│   │   │   ├── Header.tsx
│   │   │   └── Header.css
│   │   │
│   │   ├── Properties/
│   │   │   ├── PropertyList.tsx
│   │   │   ├── PropertyCard.tsx
│   │   │   ├── PropertyForm.tsx
│   │   │   ├── PropertyDetail.tsx
│   │   │   └── UnitList.tsx           # Wohneinheiten im MFH
│   │   │
│   │   ├── Tenants/
│   │   │   ├── TenantList.tsx
│   │   │   ├── TenantForm.tsx
│   │   │   ├── TenantDetail.tsx
│   │   │   └── ContractInfo.tsx       # Mietvertragsdaten
│   │   │
│   │   ├── Expenses/
│   │   │   ├── ExpenseOverview.tsx
│   │   │   ├── ExpenseForm.tsx
│   │   │   ├── ExpenseCategories.tsx
│   │   │   └── MeterReadings.tsx      # Zählerstände
│   │   │
│   │   ├── Billing/
│   │   │   ├── BillingWizard.tsx      # Schritt-für-Schritt Abrechnung
│   │   │   ├── BillingPreview.tsx
│   │   │   ├── BillingHistory.tsx
│   │   │   └── DistributionKeys.tsx   # Verteilerschlüssel
│   │   │
│   │   ├── Maintenance/
│   │   │   ├── MaintenanceList.tsx
│   │   │   ├── MaintenanceForm.tsx
│   │   │   ├── MaintenanceTimeline.tsx
│   │   │   └── CostTracking.tsx
│   │   │
│   │   ├── Export/
│   │   │   ├── ExportCenter.tsx
│   │   │   ├── TaxExport.tsx
│   │   │   └── BackupRestore.tsx
│   │   │
│   │   ├── Dashboard/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── RevenueChart.tsx
│   │   │   ├── UpcomingTasks.tsx
│   │   │   └── QuickStats.tsx
│   │   │
│   │   └── Shared/
│   │       ├── Modal.tsx
│   │       ├── DataTable.tsx
│   │       ├── FormField.tsx
│   │       ├── DatePicker.tsx
│   │       ├── CurrencyInput.tsx
│   │       ├── FileUpload.tsx
│   │       └── ConfirmDialog.tsx
│   │
│   ├── hooks/
│   │   ├── useProperties.ts
│   │   ├── useTenants.ts
│   │   ├── useExpenses.ts
│   │   └── useBilling.ts
│   │
│   ├── types/
│   │   ├── property.ts
│   │   ├── tenant.ts
│   │   ├── expense.ts
│   │   ├── billing.ts
│   │   ├── maintenance.ts
│   │   └── export.ts
│   │
│   ├── utils/
│   │   ├── formatCurrency.ts
│   │   ├── calculateBilling.ts
│   │   ├── validators.ts
│   │   └── dateHelpers.ts
│   │
│   └── styles/
│       └── variables.css
│
├── build/
│   └── entitlements.mac.plist
│
├── electron-builder.yml
├── package.json
└── tsconfig.json
```

---

## 📊 Datenmodelle (TypeScript Interfaces)

### Immobilie (Property)

```typescript
interface Property {
  id: string;
  type: 'apartment' | 'house' | 'multi-family';
  name: string;                    // z.B. "Musterstraße 5"
  
  // Adresse
  address: {
    street: string;
    houseNumber: string;
    postalCode: string;
    city: string;
    country: string;
  };
  
  // Gebäudedaten
  buildingData: {
    yearBuilt: number;
    lastRenovation?: number;
    totalArea: number;             // Gesamtfläche in m²
    plotSize?: number;             // Grundstücksgröße
    floors: number;
    heatingType: 'gas' | 'oil' | 'district' | 'heat-pump' | 'electric' | 'other';
    heatingSystem: string;         // z.B. "Zentralheizung"
    energyClass?: string;          // z.B. "C"
  };
  
  // Bei Mehrfamilienhaus: Einheiten
  units?: PropertyUnit[];
  
  // Finanzdaten
  purchaseData?: {
    purchaseDate: string;
    purchasePrice: number;
    notaryFees: number;
    agentFees: number;
    landTransferTax: number;       // Grunderwerbsteuer
  };
  
  // Laufende Kosten (jährlich)
  annualCosts: {
    propertyTax: number;           // Grundsteuer
    buildingInsurance: number;
    liability Insurance?: number;
    management?: number;           // Hausverwaltung
  };
  
  // Dokumente (Dateipfade)
  documents: PropertyDocument[];
  
  notes: string;
  createdAt: string;
  updatedAt: string;
}

interface PropertyUnit {
  id: string;
  propertyId: string;
  name: string;                    // z.B. "Wohnung EG links"
  floor: number;
  area: number;                    // Wohnfläche m²
  rooms: number;
  hasBalcony: boolean;
  hasGarden: boolean;
  parkingSpaces: number;
  currentTenantId?: string;
  baseRent: number;                // Kaltmiete
  additionalCostsAdvance: number;  // NK-Vorauszahlung
}

interface PropertyDocument {
  id: string;
  name: string;
  type: 'purchase-contract' | 'floor-plan' | 'energy-certificate' | 'insurance' | 'other';
  filePath: string;
  uploadedAt: string;
}
```

### Mieter (Tenant)

```typescript
interface Tenant {
  id: string;
  unitId: string;                  // Zuordnung zur Wohneinheit
  propertyId: string;
  
  // Persönliche Daten
  personalData: {
    salutation: 'mr' | 'mrs' | 'diverse';
    firstName: string;
    lastName: string;
    birthDate?: string;
    email?: string;
    phone?: string;
    mobile?: string;
  };
  
  // Weitere Bewohner
  additionalOccupants?: {
    name: string;
    birthDate?: string;
    relationship: string;          // z.B. "Ehepartner", "Kind"
  }[];
  
  // Mietvertrag
  contract: {
    startDate: string;
    endDate?: string;              // null = unbefristet
    baseRent: number;              // Kaltmiete
    additionalCostsAdvance: number; // NK-Vorauszahlung
    deposit: number;               // Kaution
    depositPaid: boolean;
    depositBankAccount?: string;   // Kautionskonto
    rentDueDay: number;            // Fälligkeitstag (1-28)
    paymentMethod: 'transfer' | 'direct-debit';
    notes?: string;
  };
  
  // Bankverbindung
  bankDetails?: {
    iban: string;
    bic?: string;
    accountHolder: string;
    directDebitMandate?: boolean;
  };
  
  // Kommunikation
  correspondence: CorrespondenceEntry[];
  
  // Status
  status: 'active' | 'notice-given' | 'moved-out';
  moveOutDate?: string;
  
  documents: TenantDocument[];
  createdAt: string;
  updatedAt: string;
}

interface CorrespondenceEntry {
  id: string;
  date: string;
  type: 'email' | 'letter' | 'phone' | 'in-person';
  subject: string;
  content: string;
  attachments?: string[];
}

interface TenantDocument {
  id: string;
  name: string;
  type: 'contract' | 'handover-protocol' | 'id-copy' | 'income-proof' | 'correspondence' | 'other';
  filePath: string;
  uploadedAt: string;
}
```

### Nebenkosten (Expenses)

```typescript
interface ExpenseCategory {
  id: string;
  name: string;                    // z.B. "Heizkosten", "Wasser", "Müllabfuhr"
  type: 'heating' | 'water' | 'waste' | 'cleaning' | 'garden' | 'insurance' | 'property-tax' | 'management' | 'elevator' | 'lighting' | 'other';
  distributionKey: DistributionKey;
  isRecoverable: boolean;          // Auf Mieter umlegbar?
}

type DistributionKey = 
  | 'area'                         // Nach Wohnfläche
  | 'units'                        // Nach Anzahl Einheiten
  | 'persons'                      // Nach Personenzahl
  | 'consumption'                  // Nach Verbrauch (Zähler)
  | 'fixed';                       // Fester Anteil

interface Expense {
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
  vendor: string;                  // Lieferant/Dienstleister
  description?: string;
  
  // Für verbrauchsabhängige Kosten
  consumption?: {
    totalConsumption: number;
    unit: 'kWh' | 'm³' | 'units';
  };
  
  documentPath?: string;           // Scan der Rechnung
  createdAt: string;
}

interface MeterReading {
  id: string;
  unitId: string;
  meterType: 'heating' | 'hot-water' | 'cold-water' | 'electricity' | 'gas';
  meterNumber: string;
  readingDate: string;
  value: number;
  isEstimated: boolean;            // Schätzwert?
  notes?: string;
}
```

### Nebenkostenabrechnung (Billing)

```typescript
interface BillingStatement {
  id: string;
  propertyId: string;
  unitId: string;
  tenantId: string;
  
  billingPeriod: {
    year: number;
    startDate: string;
    endDate: string;
  };
  
  // Berechnungszeitraum des Mieters (bei Mieterwechsel)
  tenantPeriod: {
    startDate: string;
    endDate: string;
    daysInPeriod: number;
    totalDaysInYear: number;
  };
  
  // Einzelpositionen
  items: BillingItem[];
  
  // Zusammenfassung
  summary: {
    totalCosts: number;            // Gesamtkosten
    tenantShare: number;           // Mieteranteil
    advancePayments: number;       // Geleistete Vorauszahlungen
    balance: number;               // Nachzahlung (+) oder Guthaben (-)
  };
  
  status: 'draft' | 'sent' | 'paid' | 'disputed';
  createdAt: string;
  sentAt?: string;
  dueDate?: string;
  paidAt?: string;
  
  // Generiertes PDF
  pdfPath?: string;
}

interface BillingItem {
  categoryId: string;
  categoryName: string;
  totalAmount: number;             // Gesamtbetrag der Kostenart
  distributionKey: DistributionKey;
  
  // Verteilungsberechnung
  calculation: {
    totalUnits: number;            // z.B. Gesamtfläche, Personenzahl
    tenantUnits: number;           // Anteil des Mieters
    percentage: number;            // Prozentsatz
  };
  
  tenantAmount: number;            // Auf Mieter entfallender Betrag
}
```

### Instandhaltung (Maintenance)

```typescript
interface MaintenanceTask {
  id: string;
  propertyId: string;
  unitId?: string;                 // Optional: spezifische Einheit
  
  title: string;
  description: string;
  category: 'repair' | 'maintenance' | 'renovation' | 'emergency' | 'inspection';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  
  status: 'planned' | 'in-progress' | 'completed' | 'cancelled';
  
  // Zeitplanung
  reportedDate: string;
  plannedDate?: string;
  completedDate?: string;
  
  // Kosten
  estimatedCost?: number;
  actualCost?: number;
  costs: MaintenanceCost[];
  
  // Handwerker/Dienstleister
  contractor?: {
    name: string;
    phone?: string;
    email?: string;
  };
  
  // Zuordnung
  isRecoverable: boolean;          // Auf Mieter umlegbar?
  isTaxDeductible: boolean;        // Steuerlich absetzbar?
  taxCategory?: 'maintenance' | 'modernization'; // §6 oder §7 EStG
  
  // Bilder/Dokumente
  attachments: MaintenanceAttachment[];
  
  notes: string;
  createdAt: string;
  updatedAt: string;
}

interface MaintenanceCost {
  id: string;
  description: string;
  amount: number;
  type: 'material' | 'labor' | 'other';
  invoiceNumber?: string;
  invoiceDate?: string;
  documentPath?: string;
}

interface MaintenanceAttachment {
  id: string;
  name: string;
  type: 'photo' | 'invoice' | 'quote' | 'report' | 'other';
  filePath: string;
  uploadedAt: string;
}
```

### Export-Strukturen

```typescript
interface TaxExportData {
  year: number;
  exportDate: string;
  
  properties: {
    property: Property;
    
    income: {
      totalRent: number;           // Mieteinnahmen gesamt
      rentByMonth: { month: number; amount: number }[];
    };
    
    expenses: {
      recoverable: number;         // Umlagefähige Kosten
      nonRecoverable: number;      // Nicht umlagefähige Kosten
      maintenance: number;         // Instandhaltungskosten
      modernization: number;       // Modernisierungskosten
      depreciation?: number;       // AfA
      interestPayments?: number;   // Darlehenszinsen
      byCategory: { category: string; amount: number }[];
    };
    
    profitLoss: number;            // Überschuss/Verlust
  }[];
  
  summary: {
    totalIncome: number;
    totalExpenses: number;
    totalProfitLoss: number;
  };
}

interface BackupData {
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
```

---

## 🖥️ Features & Screens

### 1. Dashboard
- **Übersicht aller Immobilien** mit Kachelansicht
- **Schnellstatistiken:** Gesamtmieteinnahmen, offene Nachzahlungen, anstehende Aufgaben
- **Einnahmen-Chart:** Monatliche Mieteinnahmen (letztes Jahr)
- **Anstehende Termine:** Zählerablesung, Nebenkostenabrechnung, Vertragsenden
- **Warnungen:** Überfällige Zahlungen, auslaufende Verträge, fehlende Zählerstände

### 2. Immobilienverwaltung
- **Listenansicht** aller Immobilien mit Filter/Suche
- **Detailansicht** mit allen Stammdaten
- **Einheiten-Management** für Mehrfamilienhäuser
- **Dokumentenablage** (Kaufvertrag, Grundbuch, Versicherung, etc.)
- **Verknüpfung** zu Mietern, Kosten, Instandhaltungen
- **Gebäude-Historie** (Renovierungen, Wertentwicklung)

### 3. Mieterverwaltung
- **Mieterliste** mit Statusanzeige (aktiv, gekündigt, ausgezogen)
- **Mieter-Detailseite** mit allen Vertragsdaten
- **Miethistorie** pro Wohneinheit
- **Kommunikations-Log** (Briefe, E-Mails, Gespräche)
- **Kautionsverwaltung**
- **Mieterhöhungs-Tracker** mit Berechnung (Mietspiegel-Vorbereitung)

### 4. Nebenkostenverwaltung
- **Kostenkategorien** mit Umlageschlüsseln definieren
- **Jahresübersicht** aller Kosten pro Immobilie
- **Rechnungseingabe** mit Belegupload
- **Zählerstand-Erfassung** mit Historie
- **Verbrauchsanalyse** (Jahr-über-Jahr-Vergleich)

### 5. Nebenkostenabrechnung (Wizard)
**Schritt 1:** Immobilie und Abrechnungsjahr wählen
**Schritt 2:** Abrechnungszeitraum prüfen/anpassen
**Schritt 3:** Kosten überprüfen, ggf. ergänzen
**Schritt 4:** Verteilerschlüssel pro Kostenart prüfen
**Schritt 5:** Zählerstände prüfen (bei Verbrauchsabrechnung)
**Schritt 6:** Berechnung pro Mieter anzeigen
**Schritt 7:** Vorschau der Abrechnung
**Schritt 8:** PDF generieren und speichern

- **PDF-Export:** Rechtskonforme Nebenkostenabrechnung mit allen Pflichtangaben
- **CSV-Export:** Rohdaten für eigene Auswertungen
- **Abrechnungshistorie** mit Statusverfolgung

### 6. Instandhaltung
- **Aufgabenliste** mit Filter (Status, Priorität, Immobilie)
- **Kanban-Board-Ansicht** (Geplant → In Arbeit → Erledigt)
- **Detailansicht** mit Kostentracking
- **Foto-Dokumentation** vor/nach
- **Handwerker-Kontaktverwaltung**
- **Jahresübersicht** der Instandhaltungskosten

### 7. Finanzen
- **Einnahmen-/Ausgaben-Übersicht** pro Immobilie und gesamt
- **Monatliche Cashflow-Ansicht**
- **Renditeberechnung** pro Immobilie
- **Vorjahresvergleich**

### 8. Export-Center
- **Steuerberater-Export:**
  - Einnahmen-Überschuss-Rechnung (Anlage V Vorbereitung)
  - Alle Belege als ZIP
  - Kategorisierte Kostenaufstellung
  - AfA-Berechnung (linear über Nutzungsdauer)
  
- **Nebenkostenabrechnungen:** Alle PDFs eines Jahres
- **Vollständiges Backup:** Alle Daten als JSON
- **Import:** Backup wiederherstellen

### 9. Einstellungen
- **Vermieter-Stammdaten** (für Abrechnungen)
- **Standard-Kostenkategorien** mit Umlageschlüsseln
- **PDF-Vorlage** anpassen (Logo, Fußzeile)
- **Backup-Einstellungen** (automatisches Backup)
- **Datenverzeichnis** wählen

---

## 🔌 IPC-API (preload.ts)

```typescript
interface ElectronAPI {
  // Properties
  properties: {
    getAll: () => Promise<Property[]>;
    getById: (id: string) => Promise<Property | null>;
    create: (data: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Property>;
    update: (id: string, data: Partial<Property>) => Promise<Property>;
    delete: (id: string) => Promise<void>;
  };
  
  // Units
  units: {
    getByProperty: (propertyId: string) => Promise<PropertyUnit[]>;
    create: (data: Omit<PropertyUnit, 'id'>) => Promise<PropertyUnit>;
    update: (id: string, data: Partial<PropertyUnit>) => Promise<PropertyUnit>;
    delete: (id: string) => Promise<void>;
  };
  
  // Tenants
  tenants: {
    getAll: () => Promise<Tenant[]>;
    getByProperty: (propertyId: string) => Promise<Tenant[]>;
    getByUnit: (unitId: string) => Promise<Tenant | null>;
    create: (data: Omit<Tenant, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Tenant>;
    update: (id: string, data: Partial<Tenant>) => Promise<Tenant>;
    delete: (id: string) => Promise<void>;
  };
  
  // Expenses
  expenses: {
    getByProperty: (propertyId: string, year?: number) => Promise<Expense[]>;
    create: (data: Omit<Expense, 'id' | 'createdAt'>) => Promise<Expense>;
    update: (id: string, data: Partial<Expense>) => Promise<Expense>;
    delete: (id: string) => Promise<void>;
    getCategories: () => Promise<ExpenseCategory[]>;
    updateCategory: (id: string, data: Partial<ExpenseCategory>) => Promise<ExpenseCategory>;
  };
  
  // Meter Readings
  meters: {
    getByUnit: (unitId: string) => Promise<MeterReading[]>;
    create: (data: Omit<MeterReading, 'id'>) => Promise<MeterReading>;
    update: (id: string, data: Partial<MeterReading>) => Promise<MeterReading>;
  };
  
  // Billing
  billing: {
    calculate: (propertyId: string, year: number) => Promise<BillingStatement[]>;
    save: (statement: BillingStatement) => Promise<BillingStatement>;
    getHistory: (propertyId?: string) => Promise<BillingStatement[]>;
    generatePDF: (statementId: string) => Promise<string>; // Returns file path
    generateCSV: (statementId: string) => Promise<string>;
  };
  
  // Maintenance
  maintenance: {
    getAll: (filters?: MaintenanceFilters) => Promise<MaintenanceTask[]>;
    getByProperty: (propertyId: string) => Promise<MaintenanceTask[]>;
    create: (data: Omit<MaintenanceTask, 'id' | 'createdAt' | 'updatedAt'>) => Promise<MaintenanceTask>;
    update: (id: string, data: Partial<MaintenanceTask>) => Promise<MaintenanceTask>;
    delete: (id: string) => Promise<void>;
  };
  
  // Export
  export: {
    taxData: (year: number) => Promise<TaxExportData>;
    taxDataPDF: (year: number) => Promise<string>;
    taxDataCSV: (year: number) => Promise<string>;
    allBillingsPDF: (year: number) => Promise<string>;
    fullBackup: () => Promise<string>;
    importBackup: (filePath: string) => Promise<void>;
  };
  
  // File Operations
  files: {
    selectFile: (filters?: FileFilter[]) => Promise<string | null>;
    selectDirectory: () => Promise<string | null>;
    saveFile: (data: string, defaultName: string) => Promise<string | null>;
    openFile: (path: string) => Promise<void>;
    copyToStorage: (sourcePath: string, category: string) => Promise<string>;
  };
  
  // Settings
  settings: {
    get: () => Promise<AppSettings>;
    update: (data: Partial<AppSettings>) => Promise<AppSettings>;
  };
  
  // App
  app: {
    getVersion: () => Promise<string>;
    checkForUpdates: () => Promise<UpdateInfo | null>;
    installUpdate: () => Promise<void>;
    onUpdateAvailable: (callback: (info: UpdateInfo) => void) => () => void;
  };
}
```

---

## 🎨 UI/UX Guidelines

### Design-Prinzipien
- **macOS-nativ:** Visuell an macOS Ventura+ angelehnt
- **Dark Mode:** Primär dunkles Theme (wie in variables.css)
- **Übersichtlichkeit:** Klare Hierarchie, wenig visuelle Ablenkung
- **Keyboard-First:** Shortcuts für häufige Aktionen

### CSS Variables (variables.css)

```css
:root {
  /* Colors */
  --bg-primary: #1c1c1e;
  --bg-secondary: #2c2c2e;
  --bg-tertiary: #3a3a3c;
  --text-primary: #ffffff;
  --text-secondary: #8e8e93;
  --accent-primary: #0a84ff;
  --accent-success: #30d158;
  --accent-warning: #ff9f0a;
  --accent-danger: #ff453a;
  
  /* Spacing */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
  
  /* Border Radius */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 14px;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.4);
  
  /* Typography */
  --font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
  --font-size-xs: 11px;
  --font-size-sm: 13px;
  --font-size-md: 15px;
  --font-size-lg: 17px;
  --font-size-xl: 22px;
}
```

### Navigation
- **Sidebar:** Icons + Labels für Hauptbereiche
- **Header:** Breadcrumb, Suchfeld, Aktionsbuttons
- **Content:** Splitview bei Listen (Liste links, Detail rechts)

---

## ✅ Akzeptanzkriterien

### Kernfunktionen
- [ ] Immobilien mit allen Stammdaten anlegen/bearbeiten/löschen
- [ ] Wohneinheiten für Mehrfamilienhäuser verwalten
- [ ] Mieter mit Vertragsdaten anlegen/bearbeiten
- [ ] Nebenkosten mit Belegen erfassen
- [ ] Zählerstände dokumentieren
- [ ] Automatische Nebenkostenabrechnung berechnen
- [ ] PDF-Nebenkostenabrechnung generieren (rechtlich korrekt)
- [ ] Instandhaltungsaufgaben tracken
- [ ] Steuerberater-Export (Einnahmen/Ausgaben nach Kategorien)
- [ ] Vollständiges Backup/Restore

### Technisch
- [ ] Daten lokal in electron-store gespeichert
- [ ] Dokumente im App-Verzeichnis organisiert
- [ ] Input-Validierung mit Zod
- [ ] Auto-Updates via GitHub Releases
- [ ] BEM-CSS-Konvention durchgängig
- [ ] TypeScript strict mode ohne Fehler
- [ ] Conventional Commits eingehalten

---

## 🔐 Datensicherheit

- Alle Daten lokal auf dem Mac gespeichert (kein Cloud-Sync)
- Dokumente im App-Support-Verzeichnis: `~/Library/Application Support/Immobilien Manager/`
- Regelmäßige Backup-Erinnerung (wöchentlich)
- Export-Funktion für externe Sicherung

---

## 📋 Zusätzliche Features (Nice-to-Have)

1. **Mietspiegel-Integration:** Vergleich mit lokalem Mietspiegel
2. **Mieterhöhungs-Assistent:** Berechnung und Musterschreiben
3. **Übergabeprotokoll:** PDF-Vorlage für Ein-/Auszug
4. **Kalender-Integration:** Termine in macOS Kalender
5. **Erinnerungen:** Benachrichtigungen für wichtige Fristen
6. **Mehrsprachigkeit:** Deutsch/Englisch
7. **Druck-Funktion:** Direkt aus der App drucken
8. **Such-Funktion:** Globale Suche über alle Daten
9. **Favoriten:** Schnellzugriff auf häufig genutzte Immobilien
10. **Dokumenten-Scanner:** Integration mit macOS-Scanner
11. **Mieteingangs-Tracking:** Automatischer Abgleich von Mieteingängen
12. **Mahnwesen:** Musterschreiben bei Zahlungsverzug
13. **Leerstandsverwaltung:** Tracking von unvermieteten Einheiten
14. **Rendite-Dashboard:** ROI-Berechnung pro Immobilie

---

## 🚀 Release-Planung

### Version 1.0 (MVP)
- Immobilien- und Mieterverwaltung
- Nebenkostenerfassung
- Basis-Nebenkostenabrechnung (PDF)
- Backup/Restore

### Version 1.1
- Instandhaltungs-Tracking
- Erweiterte Steuerberater-Exports
- Dashboard mit Statistiken

### Version 1.2
- Dokumentenverwaltung
- Mieterhöhungs-Assistent
- Kalender-Integration

---

## 📝 Hinweise für die Entwicklung

1. **Starte mit den Datenmodellen** – sie sind das Fundament
2. **Entwickle Service-Layer zuerst** – Business-Logik vor UI
3. **Nutze electron-store direkt** – keine zusätzliche DB nötig für diese Datenmenge
4. **PDF-Generierung:** jsPDF + jspdf-autotable für Tabellen
5. **Teste Abrechnungslogik gründlich** – hier entstehen die meisten Fehler
6. **Beachte Mieterwechsel:** Zeitanteilige Berechnung implementieren
7. **Commit-Konvention:** `feat:`, `fix:`, `docs:`, etc. gemäß Global Coding Standards

---

*Dieser Prompt dient als vollständige Spezifikation. Bei Fragen zur Implementierung einzelner Features, frag nach.*
