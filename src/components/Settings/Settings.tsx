import { useState } from 'react'
import { Button, ConfirmDialog } from '../Shared'
import './Settings.css'

function Settings() {
    const [exporting, setExporting] = useState(false)
    const [importFile, setImportFile] = useState<string | null>(null)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [deleting, setDeleting] = useState(false)

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
            alert('Backup wiederhergestellt. Die App wird neu geladen.')
            setImportFile(null)
            window.location.reload()
        } catch (error) {
            console.error('Restore failed:', error)
            alert('Wiederherstellung fehlgeschlagen')
        }
    }

    const handleDeleteAllData = async () => {
        setDeleting(true)
        try {
            await window.electronAPI.settings.clearAllData()
            alert('Alle Daten wurden gelöscht. Die App wird neu geladen.')
            window.location.reload()
        } catch (error) {
            console.error('Delete failed:', error)
            alert('Löschen fehlgeschlagen')
        } finally {
            setDeleting(false)
            setShowDeleteConfirm(false)
        }
    }

    return (
        <div className="page">
            <div className="page__header">
                <h1 className="page__title">Einstellungen</h1>
            </div>

            <div className="settings-sections">
                {/* Backup Section */}
                <section className="settings-section card">
                    <h2 className="settings-section__title">
                        <span className="settings-section__icon">💾</span>
                        Datensicherung
                    </h2>
                    <p className="settings-section__description">
                        Erstellen Sie regelmäßig Backups Ihrer Daten, um Datenverlust zu vermeiden.
                    </p>

                    <div className="settings-section__content">
                        <div className="settings-action">
                            <div className="settings-action__info">
                                <h3 className="settings-action__title">Backup erstellen</h3>
                                <p className="settings-action__description">
                                    Speichert alle Daten (Immobilien, Mieter, Kosten, Abrechnungen) als JSON-Datei.
                                </p>
                            </div>
                            <Button onClick={handleBackup} loading={exporting}>
                                Backup erstellen
                            </Button>
                        </div>

                        <div className="settings-action">
                            <div className="settings-action__info">
                                <h3 className="settings-action__title">Backup wiederherstellen</h3>
                                <p className="settings-action__description">
                                    Importiert Daten aus einer zuvor erstellten Backup-Datei.
                                </p>
                            </div>
                            <div className="settings-action__buttons">
                                <Button variant="secondary" onClick={handleSelectBackup}>
                                    Datei wählen
                                </Button>
                                {importFile && (
                                    <Button onClick={handleRestore}>
                                        Wiederherstellen
                                    </Button>
                                )}
                            </div>
                        </div>
                        {importFile && (
                            <p className="settings-file-selected">
                                📄 {importFile.split('/').pop()}
                            </p>
                        )}
                    </div>
                </section>

                {/* Danger Zone */}
                <section className="settings-section settings-section--danger card">
                    <h2 className="settings-section__title">
                        <span className="settings-section__icon">⚠️</span>
                        Gefahrenzone
                    </h2>
                    <p className="settings-section__description">
                        Achtung: Die folgenden Aktionen können nicht rückgängig gemacht werden!
                    </p>

                    <div className="settings-section__content">
                        <div className="settings-action">
                            <div className="settings-action__info">
                                <h3 className="settings-action__title">Alle Daten löschen</h3>
                                <p className="settings-action__description">
                                    Löscht alle Immobilien, Mieter, Kosten, Abrechnungen und Einstellungen.
                                    Die App wird danach mit leeren Daten neu gestartet.
                                </p>
                            </div>
                            <Button variant="danger" onClick={() => setShowDeleteConfirm(true)}>
                                Alle Daten löschen
                            </Button>
                        </div>
                    </div>
                </section>

                {/* App Info */}
                <section className="settings-section card">
                    <h2 className="settings-section__title">
                        <span className="settings-section__icon">ℹ️</span>
                        App-Information
                    </h2>
                    <div className="settings-info-grid">
                        <div className="settings-info-item">
                            <span className="settings-info-item__label">App-Version</span>
                            <span className="settings-info-item__value">1.0.0</span>
                        </div>
                        <div className="settings-info-item">
                            <span className="settings-info-item__label">Datenspeicherort</span>
                            <span className="settings-info-item__value">~/Library/Application Support/immobilien-manager</span>
                        </div>
                    </div>
                </section>
            </div>

            {/* Delete Confirmation */}
            <ConfirmDialog
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={handleDeleteAllData}
                title="Alle Daten löschen?"
                message="Diese Aktion löscht ALLE Daten unwiderruflich: Immobilien, Mieter, Kosten, Abrechnungen und Einstellungen. Erstellen Sie vorher ein Backup!"
                confirmLabel={deleting ? 'Wird gelöscht...' : 'Endgültig löschen'}
                variant="danger"
            />
        </div>
    )
}

export default Settings
