import { useState, useEffect } from 'react';

function App() {
    const [factures, setFactures] = useState([]);
    const [numeroFacture, setNumeroFacture] = useState('');
    const [fournisseur, setFournisseur] = useState('');
    const [montantHT, setMontantHT] = useState('');
    const [montantTTC, setMontantTTC] = useState('');

    const loadFactures = () => {
        fetch('http://localhost:8080/api/factures')
            .then(res => res.json())
            .then(data => setFactures(data))
            .catch(err => console.error('Erreur lors du chargement', err))
    };

    useEffect(() => {
        loadFactures();
    }, []);

    const handleSubmit = (event) => {
        event.preventDefault();

        const nouvelleFacture = {
            numeroFacture,
            fournisseur,
            montantHT: parseFloat(montantHT),
            montantTTC: parseFloat(montantTTC),
        };
        fetch('http://localhost:8080/api/factures', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json'},
            body: JSON.stringify(nouvelleFacture),
        })
            .then(response => response.json())
            .then(() => {
                loadFactures();
                setNumeroFacture('');
                setFournisseur('');
                setMontantHT('');
                setMontantTTC('');
            })
            .catch(err => console.error('Erreur lors de création:', err));
    };

    useEffect(() => {
        fetch("http://localhost:8080/api/factures")
            .then(res => res.json())
            .then(data => setFactures(data))
            .catch(err => console.log('Erreur lors du chargement:', err))
    }, [])




    return (
        <div>
            <h1>Gestion des Factures</h1>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Numéro de facture"
                    value={numeroFacture}
                    onChange={(e) => setNumeroFacture(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Fournisseur"
                    value={fournisseur}
                    onChange={(e) => setFournisseur(e.target.value)}
                />
                <input
                    type="number"
                    placeholder="Montant HT"
                    value={montantHT}
                    onChange={(e) => setMontantHT(e.target.value)}
                />
                <input
                    type="number"
                    placeholder="Montant TTC"
                    value={montantTTC}
                    onChange={(e) => setMontantTTC(e.target.value)}
                />
                <button type="submit">Ajouter</button>
            </form>
            <ul>
                {factures.map(facture => (
                    <li key={facture.id}>
                        {facture.numeroFacture} - {facture.fournisseur} - {facture.montantTTC} €
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default App;