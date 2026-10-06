import React, { useEffect, useState } from 'react';

function FactureForm({ onCreate, onUpdate, editingFacture, onCancel }){
    const [numeroFacture, setNumeroFacture] = useState('');
    const [fournisseur, setFournisseur] = useState('');
    const [dateFacture, setDateFacture] = useState('');
    const [montantHT, setMontantHT] = useState('');
    const [montantTTC, setMontantTTC] = useState('');

    useEffect(() => {
        if(editingFacture){
            setNumeroFacture(editingFacture.numeroFacture || '');
            setFournisseur(editingFacture.fournisseur || '');
            setDateFacture(editingFacture.dateFacture || '');
            setMontantHT(editingFacture.montantHT ?? '');
            setMontantTTC(editingFacture.montantTTC ?? '');
        } else {
            setNumeroFacture('');
            setFournisseur('');
            setDateFacture('');
            setMontantHT('');
            setMontantTTC('');
        }
    }, [editingFacture]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const payload = {
            numeroFacture,
            fournisseur,
            dateFacture,
            montantHT: parseFloat(montantHT) || 0,
            montantTTC: parseFloat(montantTTC) || 0
        };
        if(editingFacture) onUpdate(editingFacture.id, payload);
        else onCreate(payload);
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>{editingFacture?.statut === 'NEEDS_REVIEW' ? 'Vérifier les informations extraites' : editingFacture ? 'Modifier la facture' : 'Ajouter une facture'}</h2>
            <input value={numeroFacture} onChange={e=>setNumeroFacture(e.target.value)} placeholder="Numéro de facture" />
            <input value={fournisseur} onChange={e=>setFournisseur(e.target.value)} placeholder="Fournisseur" />
            <input value={dateFacture} onChange={e=>setDateFacture(e.target.value)} placeholder="Date de facture" />
            <input type="number" step="any" value={montantHT} onChange={e=>setMontantHT(e.target.value)} placeholder="Montant HT" />
            <input type="number" step="any" value={montantTTC} onChange={e=>setMontantTTC(e.target.value)} placeholder="Montant TTC" />
            <button type="submit">{editingFacture?.statut === 'NEEDS_REVIEW' ? 'Valider la facture' : editingFacture ? 'Modifier' : 'Ajouter'}</button>
            {editingFacture && <button type="button" onClick={onCancel}>Annuler</button>}
        </form>
    );
}

export default FactureForm;