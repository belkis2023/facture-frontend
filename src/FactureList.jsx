import React from 'react';

function formatInvoiceDate(value) {
    if (!value) return '—';
    const trimmed = value.trim();
    let match = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (match) return `${match[3]}/${match[2]}/${match[1]}`;

    match = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (match) {
        return `${match[2].padStart(2, '0')}/${match[1].padStart(2, '0')}/${match[3]}`;
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

    return value;
}

function FactureList({ factures = [], onView, onDelete, onEdit }){
    if(factures.length === 0) {
        return (
            <div className="empty-state">
                <strong>Aucune facture pour le moment</strong>
                <span>Importez une facture pour commencer votre suivi.</span>
            </div>
        );
    }

    return (
        <div className="table-scroll">
            <table className="invoice-table">
                <thead>
                    <tr>
                        <th>Facture</th>
                        <th>Fournisseur</th>
                        <th>Date</th>
                        <th>Montant TTC</th>
                        <th>Statut</th>
                        <th><span className="visually-hidden">Actions</span></th>
                    </tr>
                </thead>
                <tbody>
                    {factures.map(f => (
                        <tr key={f.id}>
                            <td>
                                <strong>{f.numeroFacture || 'Numéro non détecté'}</strong>
                                <span className="table-secondary">{f.nomFichier}</span>
                            </td>
                            <td>{f.fournisseur || '—'}</td>
                            <td>{formatInvoiceDate(f.dateFacture)}</td>
                            <td>{f.montantTTC != null ? `${Number(f.montantTTC).toLocaleString('fr-FR', {minimumFractionDigits: 2})} €` : '—'}</td>
                            <td>
                                <span className={`status-badge ${f.statut === 'NEEDS_REVIEW' ? 'status-review' : 'status-validated'}`}>
                                    {f.statut === 'NEEDS_REVIEW' ? 'À vérifier' : f.statut === 'VALIDATED' ? 'Validée' : f.statut || 'Importée'}
                                </span>
                            </td>
                            <td>
                                <div className="row-actions">
                                    <button className="button-link" type="button" onClick={() => onEdit(f)}>Modifier</button>
                                    {f.cheminFichier && <button className="button-link" type="button" onClick={() => onView(f.id)}>Document</button>}
                                    <button className="button-link danger-link" type="button" onClick={() => onDelete(f.id)}>Supprimer</button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default FactureList;