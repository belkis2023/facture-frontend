import React from 'react';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';


function FileUploaderOriginal() {

    //we're defining uploading states
    const UPLOAD_STATUS = {
        IDLE: 'idle',
        UPLOADING: 'uploading',
        SUCCESS: 'success',
        ERROR: 'error',
    };

    //these states are for when uploading a file and checking if the infos are verified or not yet
    const INVOICE_STATUS = {
        UPLOADED: 'uploaded',
        PROCESSING: 'processing',
        VERIFIED: 'verified',
        ERROR: 'error'
    }

    const fileInputRef = useRef(null);
    //file stores the selected file
    const [file, setFile] = useState();
    const [status, setStatus] = useState(UPLOAD_STATUS.IDLE);
    //to show uploading progress
    const [uploadProgress, setUploadProgress] = useState(0);
    //for selecting files
    const [selectedFiles, setSelectedFiles] = useState(null);


    async function handleFileUpload() {
        if(!file) return;

        setStatus(UPLOAD_STATUS.UPLOADING);
        setUploadProgress(0);

        const formData = new FormData();
        formData.append('file', file);

        try {
            await axios.post(
                'http://localhost:8080/api/factures/upload',
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    onUploadProgress: (progressEvent) => {
                        const progress = progressEvent.total
                        ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
                        : 0;
                        setUploadProgress(progress);
                    }
                }
            );
            setStatus(UPLOAD_STATUS.SUCCESS);
            setUploadProgress(100);
        } catch {
            setStatus(UPLOAD_STATUS.ERROR);
            setUploadProgress(0);
        }
    }


    //to handle multiple upload
    //to change this function to support an invoice creation + file upload at the same time,
    // we have to create an invoice object for every file 
    async function handleUpload() {
        if(selectedFiles.length === 0) return;

        setStatus(UPLOAD_STATUS.UPLOADING);
        setUploadProgress(0);

        const formData = new FormData();
        selectedFiles.forEach((file) => {
            formData.append('files', file);
        })

        try {
            const response = await axios.post(
                'http://localhost:8080/api/factures/upload-multiple',
                formData,
                {
                    headers: { 'Content-Type': 'multipart/form-data' },
                    onUploadProgress: (progressEvent) => {
                        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        setUploadProgress(percent);
                    },
                }
            );

            setStatus(UPLOAD_STATUS.SUCCESS);
            setSelectedFiles(null);
            fileInputRef.current.value = "";
            console.log(response.data);
        } catch (error) {
            setStatus(UPLOAD_STATUS.ERROR);
            console.log(error);
        }

    }


    //to select multiple files
    const handleFileSelect = (e) => {
        setFile(e.target.files[0]);
        const newFiles = Array.from(e.target.files);
        setSelectedFiles((prevFiles) => [...(prevFiles || []), ...newFiles]);

    }

    //to remove a selected file
    const removeFile = (index) => {
        setSelectedFiles(selectedFiles.filter((_, id) => id !== index))
    }

    return(
        <div className="space-y-4">
            <input type="file"
                   multiple
                   onChange={handleFileSelect}
                   ref={fileInputRef}
            />
            {selectedFiles && (
                <div>
                    <ul>
                        {selectedFiles.map((file, index) => (
                            <li key={index}>
                                {file.name}
                                <button type="button"
                                        onClick={() => removeFile(index)}
                                >
                                    x
                                </button>
                            </li>
                        ))}
                    </ul>
                    {status === UPLOAD_STATUS.UPLOADING && (
                        <div className="h-4 w-full bg-gray-300 rounded-full">
                            <div className="h-4 bg-blue-500 rounded-full transition-all" style={{width: `${uploadProgress}%`}}>

                            </div>
                        </div>

                    )}
                    <p className="text-sm text-gray-600">{uploadProgress}%</p>
                    <button onClick={handleUpload}>Uploader tout</button>
                </div>
            )}
        </div>
    );

}

export default FileUploaderOriginal

