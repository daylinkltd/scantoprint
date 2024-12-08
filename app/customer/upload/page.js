'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import styles from './page.module.css';

function UploadContent() {
  const searchParams = useSearchParams();
  const storeId = searchParams.get('storeId');
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(prevFiles => [...prevFiles, ...selectedFiles]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setUploading(true);

    // TODO: Implement actual file upload to the store's account
    // For now, we'll simulate an upload
    setTimeout(() => {
      alert('Files uploaded successfully!');
      setUploading(false);
      setFiles([]);
    }, 2000);
  };

  const removeFile = (index) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  return (
    <div className={styles.container}>
      <h1>Upload Documents for Printing</h1>
      <p className={styles.storeInfo}>Uploading to Store ID: {storeId}</p>

      <form onSubmit={handleUpload} className={styles.uploadForm}>
        <div className={styles.dropzone}>
          <input
            type="file"
            onChange={handleFileChange}
            multiple
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            id="fileInput"
          />
          <label htmlFor="fileInput">
            Click to select files or drag and drop
          </label>
        </div>

        {files.length > 0 && (
          <div className={styles.fileList}>
            <h3>Selected Files:</h3>
            {files.map((file, index) => (
              <div key={index} className={styles.fileItem}>
                <span>{file.name}</span>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className={styles.removeButton}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        <button
          type="submit"
          disabled={files.length === 0 || uploading}
          className={styles.uploadButton}
        >
          {uploading ? 'Uploading...' : 'Upload for Printing'}
        </button>
      </form>
    </div>
  );
}

export default function Upload() {
  return (
    <Suspense fallback={<div className={styles.loading}>Loading...</div>}>
      <UploadContent />
    </Suspense>
  );
} 