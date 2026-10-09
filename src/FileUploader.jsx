import React, { useRef, useState } from 'react';
import axios from 'axios';

function FileUploader({ onUploaded }) {
    const fileInputRef = useRef(null);
    const [files, setFiles] = useState([]);
    const [status, setStatus] = useState('idle');
    const [uploadProgress, setUploadProgress] = useState(0);
    const [currentFileIndex, setCurrentFileIndex] = useState(0);
    const [errorMessage, setErrorMessage] = useState('');

    async function handleFileUpload(){
        if(files.length === 0) return;
        setErrorMessage('');
        setStatus('uploading');
        setUploadProgress(0);

        const uploadedInvoices = [];
        const errors = [];
        for (const [index, file] of files.entries()) {
            setCurrentFileIndex(index);
            setUploadProgress(0);
            const formData = new FormData();
            formData.append('file', file);

            try {
                const response = await axios.post('http://localhost:8080/api/factures/upload', formData, {
                    headers: {'Content-Type':'multipart/form-data'},
                    onUploadProgress: event => {
                        setUploadProgress(event.total ? Math.round((event.loaded * 100) / event.total) : 0);
                    }
                });
                uploadedInvoices.push(response.data);
            } catch (err) {
                console.error(err);
                const responseMessage = err.response?.data;
                const message = typeof responseMessage === 'string'
                    ? responseMessage
                    : responseMessage?.message || err.message || 'Échec de l’import.';
                errors.push(`${file.name} : ${message}`);
            }
        }

        if (uploadedInvoices.length > 0 && onUploaded) onUploaded(uploadedInvoices);
        setFiles([]);
        if (fileInputRef.current) fileInputRef.current.value = '';

        if (errors.length > 0) {
            setStatus('error');
            setUploadProgress(0);
            setErrorMessage(
                uploadedInvoices.length > 0
                    ? `${uploadedInvoices.length} facture(s) importée(s). Certains fichiers n’ont pas pu être importés : ${errors.join(' ')}`
                    : errors.join(' ')
            );
        } else {
            setStatus('success');
            setUploadProgress(100);
        }
    }

    function handleFileChange(event) {
        const selectedFiles = Array.from(event.target.files || []);
        setFiles(currentFiles => {
            const existingFiles = new Set(
                currentFiles.map(file => `${file.name}-${file.size}-${file.lastModified}`)
            );
            const newFiles = selectedFiles.filter(file => {
                const key = `${file.name}-${file.size}-${file.lastModified}`;
                if (existingFiles.has(key)) return false;
                existingFiles.add(key);
                return true;
            });
            return [...currentFiles, ...newFiles];
        });
        setStatus('idle');
        setErrorMessage('');
        setUploadProgress(0);
        // Clear the picker so selecting the same file again triggers a change event.
        event.target.value = '';
    }

    function removeFile(indexToRemove) {
        setFiles(currentFiles => currentFiles.filter((_, index) => index !== indexToRemove));
        setStatus('idle');
        setErrorMessage('');
        if (fileInputRef.current) fileInputRef.current.value = '';
    }

    return (
        <div className="uploader">
            <label className="drop-area" htmlFor="invoice-file">
                <span className="upload-icon" aria-hidden="true">↑</span>
                <span className="drop-title">Choisir un ou plusieurs fichiers</span>
                <span className="drop-hint">Images : JPG, PNG, TIFF ou WEBP</span>
                <input
                    id="invoice-file"
                    className="file-input"
                    type="file"
                    accept="image/jpeg,image/png,image/bmp,image/tiff,image/webp"
                    multiple
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    disabled={status === 'uploading'}
                />
            </label>
            {files.length > 0 && (
                <div className="selected-files">
                    <p className="selected-count">{files.length} fichier(s) sélectionné(s)</p>
                    {files.map((file, index) => (
                        <div className="selected-file" key={`${file.name}-${file.lastModified}-${index}`}>
                            <div className="file-details">
                                <span className="file-name">{file.name}</span>
                                <span className="file-size">{(file.size / (1024 * 1024)).toFixed(2)} Mo</span>
                            </div>
                            {status !== 'uploading' && <button className="button-link" type="button" onClick={() => removeFile(index)}>Retirer</button>}
                        </div>
                    ))}
                </div>
            )}
            {status === 'uploading' && (
                <div className="progress-wrap" aria-live="polite">
                    <div className="progress-track"><div className="progress-value" style={{width: `${((currentFileIndex + uploadProgress / 100) / files.length) * 100}%`}} /></div>
                    <span>Fichier {currentFileIndex + 1}/{files.length} · Téléversement et extraction…</span>
                </div>
            )}
            {status === 'error' && <p className="form-error" role="alert">{errorMessage}</p>}
            {status === 'success' && <p className="success-message" role="status">Import terminé. Vérifiez les informations proposées.</p>}
            <button className="primary-button upload-button" type="button" onClick={handleFileUpload} disabled={files.length === 0 || status === 'uploading'}>
                {status === 'uploading' ? 'Import en cours…' : files.length > 1 ? `Importer ${files.length} factures` : 'Importer et extraire'}
            </button>
        </div>
    );
}

export default FileUploader;