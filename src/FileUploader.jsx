import React, { useRef, useState } from 'react';
import axios from 'axios';

function FileUploader({ onUploaded }) {
    const fileInputRef = useRef(null);
    const [file, setFile] = useState(null);
    const [status, setStatus] = useState('idle');
    const [uploadProgress, setUploadProgress] = useState(0);

    async function handleFileUpload(){
        if(!file) return;
        setStatus('uploading'); setUploadProgress(0);
        const formData = new FormData(); formData.append('file', file);
        try{
            await axios.post('http://localhost:8080/api/factures/upload', formData, {
                headers: {'Content-Type':'multipart/form-data'},
                onUploadProgress: e => {
                    const p = e.total ? Math.round((e.loaded*100)/e.total) : 0;
                    setUploadProgress(p);
                }
            });
            setStatus('success'); setUploadProgress(100); setFile(null); fileInputRef.current.value = '';
            if (onUploaded) onUploaded();
        } catch (err) {
            console.error(err); setStatus('error'); setUploadProgress(0);
        }
    }

    return (
        <div className="space-y-4">
            <input type="file" ref={fileInputRef} onChange={e => setFile(e.target.files[0])} />
            {file && (
                <div>
                    <div>{file.name} <button onClick={() => setFile(null)}>x</button></div>
                    {status === 'uploading' && <div style={{width:`${uploadProgress}%`}} className="h-4 bg-blue-500"/>}
                    <p>{uploadProgress}%</p>
                    <button onClick={handleFileUpload}>Upload Invoice</button>
                </div>
            )}
        </div>
    );
}

export default FileUploader;