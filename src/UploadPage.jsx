import React, { useEffect, useState } from 'react';
import FileUploader from './FileUploader';
import FactureForm from './FactureForm';
import FactureList from './FactureList';

function UploadPage() {

    //this is basically the parent component
    //it contains: the editing/add new invoice inputs + the upload invoice attachment + the list of invoices

    const [factures, setFactures] = useState([]);
    const [editingFacture, setEditingFacture] = useState(null);

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
            const res = await fetch(`http://localhost:8080/api/factures/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const updatedFacture = await res.json();

            setFactures(prev =>
                prev.map(f => (f.id === id ? updatedFacture : f))
            );
            setEditingFacture(null);
        } catch (err) {
            console.error('Erreur lors de la mise à jour:', err);
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
        <div>
            <h1 className="text-3xl font-bold text-blue-600">Gestion des Factures</h1>

            <FileUploader onUploaded={() => {
                fetch('http://localhost:8080/api/factures')
                    .then(res => res.json())
                    .then(setFactures)
                    .catch(console.error);
            }} />

            <FactureForm
                onCreate={createFacture}
                onUpdate={updateFacture}
                editingFacture={editingFacture}
                onCancel={() => setEditingFacture(null)}
            />

            <FactureList
                factures={factures}
                onView={viewFacture}
                onDelete={deleteFacture}
                onEdit={f => setEditingFacture(f)}
            />
        </div>
    );
}

export default UploadPage;