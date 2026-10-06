import React, { useEffect, useState } from 'react';

function FactureForm({ onCreate, onUpdate, editingFacture, onCancel }){
    const [numeroFacture, setNumeroFacture] = useState('');
    const [fournisseur, setFournisseur] = useState('');
    const [montantHT, setMontantHT] = useState('');
    const [montantTTC, setMontantTTC] = useState('');

    useEffect(() => {
        if(editingFacture){
            setNumeroFacture(editingFacture.numeroFacture || '');
            setFournisseur(editingFacture.fournisseur || '');
            setMontantHT(editingFacture.montantHT ?? '');
            setMontantTTC(editingFacture.montantTTC ?? '');
        } else {
            setNumeroFacture(''); setFournisseur(''); setMontantHT(''); setMontantTTC('');
        }
    }, [editingFacture]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const payload = {
            numeroFacture,
            fournisseur,
            montantHT: parseFloat(montantHT) || 0,
            montantTTC: parseFloat(montantTTC) || 0
        };
        if(editingFacture) onUpdate(editingFacture.id, payload);
        else onCreate(payload);
    };

    return (
        <form onSubmit={handleSubmit}>
            <input value={numeroFacture} onChange={e=>setNumeroFacture(e.target.value)} placeholder="Numéro de facture" />
            <input value={fournisseur} onChange={e=>setFournisseur(e.target.value)} placeholder="Fournisseur" />
            <input type="number" value={montantHT} onChange={e=>setMontantHT(e.target.value)} placeholder="Montant HT" />
            <input type="number" value={montantTTC} onChange={e=>setMontantTTC(e.target.value)} placeholder="Montant TTC" />
            <button type="submit">{editingFacture ? 'Modifier' : 'Ajouter'}</button>
            {editingFacture && <button type="button" onClick={onCancel}>Annuler</button>}
        </form>
    );
}

export default FactureForm;