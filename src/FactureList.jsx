import React from 'react';

function FactureList({ factures = [], onView, onDelete, onEdit }){
    if(factures.length === 0) return <p>Aucune facture disponible.</p>;
    return (
        <ul>
            {factures.map(f => (
                <li key={f.id}>
                    {f.nomFichier} - {f.statut} - {f.dateUpload}
                    <button onClick={() => onView(f.id)}>Voir Document</button>
                    <button onClick={() => onDelete(f.id)}>Supprimer</button>
                    <button onClick={() => onEdit(f)}>Modifier</button>
                </li>
            ))}
        </ul>
    );
}

export default FactureList;