import React, { useEffect, useState } from 'react';
import FileUploader from './FileUploader';
import FactureForm from './FactureForm';
import FactureList from './FactureList';

function UploadPage() {

    //this is basically the parent component
    //it contains: the editing/add new invoice inputs + the upload invoice attachment + the list of invoices

    const [factures, setFactures] = useState([]);
    const [editingFacture, setEditingFacture] = useState(null);
    const [formError, setFormError] = useState('');
    const reviewCount = factures.filter(f => f.statut === 'NEEDS_REVIEW').length;
    const validatedCount = factures.filter(f => f.statut === 'VALIDATED').length;

    useEffect(() => {
        async function loadFactures() {
            try {
                const res = await fetch('http://localhost:8080/api/factures');
                const data = await res.json();
                setFactures(data);
            } catch (err) {
                console.error('Erreur lors du chargement', err);
            }
        }

        loadFactures();
    }, []);

    const createFacture = async (data) => {
        try {
            const res = await fetch('http://localhost:8080/api/factures', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const newFacture = await res.json();
            setFactures(prev => [...prev, newFacture]);
        } catch (err) {
            console.error('Erreur lors de création:', err);
        }
    };

    const updateFacture = async (id, data) => {
        try {
            setFormError('');
            const res = await fetch(`http://localhost:8080/api/factures/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error('La facture n’a pas pu être mise à jour.');
            const updatedFacture = await res.json();
            setFactures(prev =>
                prev.map(f => (f.id === id ? updatedFacture : f))
            );
            if (editingFacture?.id === id && editingFacture.statut === 'NEEDS_REVIEW') {
                const nextReview = factures.find(f => f.id !== id && f.statut === 'NEEDS_REVIEW');
                setEditingFacture(nextReview || null);
            } else {
                setEditingFacture(null);
            }
        } catch (err) {
            console.error('Erreur lors de la mise à jour:', err);
            setFormError(err.message || 'La facture n’a pas pu être mise à jour.');
        }
    };

    const deleteFacture = async (id) => {
        try {
            await fetch(`http://localhost:8080/api/factures/${id}`, {
                method: 'DELETE'
            });
            setFactures(prev => prev.filter(f => f.id !== id));
        } catch (err) {
            console.error('Erreur lors de la suppression:', err);
        }
    };

    const viewFacture = (id) => {
        window.open(`http://localhost:8080/api/factures/${id}/file`, '_blank');
    };

    return (
        <main className="page-shell">
            <header className="page-header">
                <div>
                    <p className="eyebrow">ESPACE DE TRAVAIL</p>
                    <h1 className="page-title">Gestion des factures</h1>
                    <p className="page-subtitle">Importez vos factures, vérifiez les informations détectées et gardez votre suivi à jour.</p>
                </div>
                <div className="summary-cards" aria-label="Résumé des factures">
                    <div className="summary-card"><span className="summary-label">Total</span><strong>{factures.length}</strong></div>
                    <div className="summary-card"><span className="summary-label">À vérifier</span><strong>{reviewCount}</strong></div>
                    <div className="summary-card"><span className="summary-label">Validées</span><strong>{validatedCount}</strong></div>
                </div>
            </header>

            <section className="workspace-grid" aria-label="Import et saisie de facture">
                <div className="panel">
                    <div className="panel-heading">
                        <div><span className="step-label">ÉTAPE 1</span><h2>Importer une facture</h2></div>
                    </div>
                    <p className="panel-description">Ajoutez une image de facture. Les informations détectées seront proposées pour vérification.</p>
                    <FileUploader onUploaded={drafts => {
                        setFactures(prev => [...prev, ...drafts]);
                        setEditingFacture(drafts[0]);
                        setFormError('');
                    }} />
                </div>

                <div className="panel">
                    <div className="panel-heading">
                        <div>
                            <span className="step-label">ÉTAPE 2</span>
                            <h2>{editingFacture ? 'Vérifier les informations' : 'Saisie manuelle'}</h2>
                        </div>
                        {editingFacture?.statut === 'NEEDS_REVIEW' && <span className="status-badge status-review">À vérifier</span>}
                    </div>
                    <p className="panel-description">Corrigez les champs si nécessaire avant de valider la facture.</p>
                    {formError && <p className="form-error" role="alert">{formError}</p>}
                    <FactureForm
                        onCreate={createFacture}
                        onUpdate={updateFacture}
                        editingFacture={editingFacture}
                        onCancel={() => {
                            setEditingFacture(null);
                            setFormError('');
                        }}
                    />
                </div>
            </section>

            <section className="panel list-panel">
                <div className="panel-heading list-heading">
                    <div><span className="step-label">VOTRE SUIVI</span><h2>Factures enregistrées</h2></div>
                    <span className="count-badge">{factures.length}</span>
                </div>
                <FactureList
                    factures={factures}
                    onView={viewFacture}
                    onDelete={deleteFacture}
                    onEdit={f => {
                        setEditingFacture(f);
                        setFormError('');
                    }}
                />
            </section>
        </main>
    );
}

export default UploadPage;