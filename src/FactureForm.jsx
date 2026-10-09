import React, { useEffect, useState } from 'react';

function toDisplayDate(value) {
    if (!value) return '';

    const trimmed = value.trim();
    let match = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (match) return `${match[3]}/${match[2]}/${match[1]}`;

    match = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (match) {
        return `${match[1].padStart(2, '0')}/${match[2].padStart(2, '0')}/${match[3]}`;
    }

    match = trimmed.match(/^([A-Za-z]+)\s+(\d{1,2}),?\s+(\d{4})$/);
    if (match) {
        const months = {
            january: '01', february: '02', march: '03', april: '04',
            may: '05', june: '06', july: '07', august: '08',
            september: '09', october: '10', november: '11', december: '12',
            jan: '01', feb: '02', mar: '03', apr: '04', jun: '06',
            jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12'
        };
        const month = months[match[1].toLowerCase()];
        if (month) return `${match[2].padStart(2, '0')}/${month}/${match[3]}`;
    }

    return '';
}

function toIsoDate(value) {
    const match = value.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (!match) return null;

    const [, day, month, year] = match;
    const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
    if (
        date.getUTCFullYear() !== Number(year)
        || date.getUTCMonth() !== Number(month) - 1
        || date.getUTCDate() !== Number(day)
    ) {
        return null;
    }

    return `${year}-${month}-${day}`;
}

function FactureForm({ onCreate, onUpdate, editingFacture, onCancel }){
    const [numeroFacture, setNumeroFacture] = useState('');
    const [fournisseur, setFournisseur] = useState('');
    const [dateFacture, setDateFacture] = useState('');
    const [montantHT, setMontantHT] = useState('');
    const [montantTTC, setMontantTTC] = useState('');
    const [dateError, setDateError] = useState('');

    useEffect(() => {
        if(editingFacture){
            setNumeroFacture(editingFacture.numeroFacture || '');
            setFournisseur(editingFacture.fournisseur || '');
            setDateFacture(toDisplayDate(editingFacture.dateFacture));
            setMontantHT(editingFacture.montantHT ?? '');
            setMontantTTC(editingFacture.montantTTC ?? '');
        } else {
            setNumeroFacture('');
            setFournisseur('');
            setDateFacture('');
            setMontantHT('');
            setMontantTTC('');
        }
        setDateError('');
    }, [editingFacture]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const normalizedDate = dateFacture.trim() ? toIsoDate(dateFacture) : '';
        if (dateFacture.trim() && !normalizedDate) {
            setDateError('Saisissez une date valide au format JJ/MM/AAAA.');
            return;
        }
        setDateError('');

        const payload = {
            numeroFacture,
            fournisseur,
            dateFacture: normalizedDate,
            montantHT: parseFloat(montantHT) || 0,
            montantTTC: parseFloat(montantTTC) || 0
        };
        if(editingFacture) onUpdate(editingFacture.id, payload);
        else onCreate(payload);
    };

    return (
        <form className="invoice-form" onSubmit={handleSubmit}>
            <label>
                Numéro de facture
                <input value={numeroFacture} onChange={e=>setNumeroFacture(e.target.value)} placeholder="Ex. FAC-2026-001" />
            </label>
            <label>
                Fournisseur
                <input value={fournisseur} onChange={e=>setFournisseur(e.target.value)} placeholder="Nom du fournisseur" />
            </label>
            <label>
                Date de facture
                <input
                    type="text"
                    inputMode="numeric"
                    value={dateFacture}
                    onChange={e => {
                        setDateFacture(e.target.value);
                        setDateError('');
                    }}
                    placeholder="JJ/MM/AAAA"
                    aria-invalid={Boolean(dateError)}
                    aria-describedby={dateError ? 'invoice-date-error' : undefined}
                />
            </label>
            {dateError && <p className="form-error" id="invoice-date-error" role="alert">{dateError}</p>}
            <div className="amount-fields">
                <label>
                    Montant HT
                    <input type="number" step="any" value={montantHT} onChange={e=>setMontantHT(e.target.value)} placeholder="0,00" />
                </label>
                <label>
                    Montant TTC
                    <input type="number" step="any" value={montantTTC} onChange={e=>setMontantTTC(e.target.value)} placeholder="0,00" />
                </label>
            </div>
            <div className="form-actions">
                <button className="primary-button" type="submit">
                    {editingFacture?.statut === 'NEEDS_REVIEW' ? 'Valider la facture' : editingFacture ? 'Enregistrer les modifications' : 'Ajouter la facture'}
                </button>
                {editingFacture && <button className="secondary-button" type="button" onClick={onCancel}>Annuler</button>}
            </div>
        </form>
    );
}

export default FactureForm;