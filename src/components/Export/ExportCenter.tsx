import { useState } from 'react'
import { Button } from '../Shared'
import './Export.css'

function ExportCenter() {
    const [exporting, setExporting] = useState(false)
    const [importFile, setImportFile] = useState<string | null>(null)

    const handleBackup = async () => {
        setExporting(true)
        try {
            const path = await window.electronAPI.export.fullBackup()
            if (path) {
                alert(`Backup gespeichert: ${path}`)
            }
        } catch (error) {
            console.error('Backup failed:', error)
            alert('Backup fehlgeschlagen')
        } finally {
            setExporting(false)
        }
    }

    const handleSelectBackup = async () => {
        const path = await window.electronAPI.files.selectFile([
            { name: 'JSON', extensions: ['json'] }
        ])
        setImportFile(path)
    }

    const handleRestore = async () => {
        if (!importFile) return
        try {
            await window.electronAPI.export.importBackup(importFile)
            alert('Backup wiederhergestellt. Bitte App neu starten.')
            setImportFile(null)
        } catch (error) {
            console.error('Restore failed:', error)
            alert('Wiederherstellung fehlgeschlagen')
        }
    }

    return (
        <div className="page">
            <div className="page__header">
                <h1 className="page__title">Export & Backup</h1>
            </div>

            <div className="export-grid">
                {/* Backup Section */}
                <section className="export-section card">
                    <div className="export-section__icon">💾</div>
                    <h2 className="export-section__title">Backup erstellen</h2>
                    <p className="export-section__description">
                        Sichern Sie alle Daten (Immobilien, Mieter, Kosten, Abrechnungen) als JSON-Datei.
                    </p>
                    <Button onClick={handleBackup} loading={exporting}>
                        Backup erstellen
                    </Button>
                </section>

                {/* Restore Section */}
                <section className="export-section card">
                    <div className="export-section__icon">📥</div>
                    <h2 className="export-section__title">Backup wiederherstellen</h2>
                    <p className="export-section__description">
                        Stellen Sie Ihre Daten aus einer Backup-Datei wieder her.
                    </p>
                    <div className="export-section__actions">
                        <Button variant="secondary" onClick={handleSelectBackup}>
                            Datei wählen
                        </Button>
                        {importFile && (
                            <>
                                <span className="export-section__file">{importFile.split('/').pop()}</span>
                                <Button variant="danger" onClick={handleRestore}>
                                    Wiederherstellen
                                </Button>
                            </>
                        )}
                    </div>
                </section>

                {/* Tax Export Section */}
                <section className="export-section card">
                    <div className="export-section__icon">📊</div>
                    <h2 className="export-section__title">Steuerberater-Export</h2>
                    <p className="export-section__description">
                        Exportieren Sie Einnahmen und Ausgaben für Ihren Steuerberater (Anlage V Vorbereitung).
                    </p>
                    <Button variant="secondary" disabled>
                        Demnächst verfügbar
                    </Button>
                </section>

                {/* PDF Export Section */}
                <section className="export-section card">
                    <div className="export-section__icon">📄</div>
                    <h2 className="export-section__title">Abrechnungen als PDF</h2>
                    <p className="export-section__description">
                        Exportieren Sie alle Nebenkostenabrechnungen eines Jahres als PDF.
                    </p>
                    <Button variant="secondary" disabled>
                        Demnächst verfügbar
                    </Button>
                </section>
            </div>
        </div>
    )
}

export default ExportCenter
