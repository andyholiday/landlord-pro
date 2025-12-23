# Landlord Pro

Professionelle Mac-App zur Verwaltung und Abrechnung von Mietimmobilien.

![Landlord Pro](build/icon.png)

## Features

- 🏢 **Immobilienverwaltung** - Mehrfamilienhäuser, Eigentumswohnungen, Einfamilienhäuser
- 👥 **Mieterverwaltung** - Verträge, Kontaktdaten, Korrespondenz
- 💰 **Nebenkostenerfassung** - Kategorisiert, mit Verteilerschlüsseln
- 📄 **Nebenkostenabrechnung** - 6-Schritt-Wizard mit Berechnung
- 🔧 **Instandhaltung** - Aufgaben, Prioritäten, Kostenverfolgung
- 💾 **Backup & Restore** - Datensicherung als JSON

## Installation

### macOS

1. Lade die neueste `.dmg`-Datei von den [Releases](../../releases) herunter
2. Öffne die DMG und ziehe die App in den Applications-Ordner
3. Starte Landlord Pro

## Entwicklung

### Voraussetzungen

- Node.js 20+
- npm

### Setup

```bash
# Dependencies installieren
npm install

# Entwicklungsserver starten
npm run dev

# App bauen
npm run build
```

### Projekt-Struktur

```
├── electron/           # Electron Main & Preload
├── src/
│   ├── components/    # React Komponenten
│   ├── styles/        # CSS Variablen
│   └── types/         # TypeScript Interfaces
├── build/             # App Icons
└── public/            # Statische Dateien
```

## Tech Stack

- **Electron** - Desktop App Framework
- **React** - UI Library
- **TypeScript** - Type Safety
- **Vite** - Build Tool
- **electron-store** - Lokale Datenspeicherung

## Lizenz

MIT
