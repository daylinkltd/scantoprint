'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import styles from './page.module.css';

export default function Upload() {
  const router = useRouter();
  const params = useParams();
  const storeId = params.storeId;
  
  const [store, setStore] = useState(null);
  const [customerName, setCustomerName] = useState('');
  const [files, setFiles] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [validating, setValidating] = useState(true);

  useEffect(() => {
    validateStore();
    const interval = setInterval(updateTimers, 1000);
    return () => clearInterval(interval);
  }, [storeId]);

  const validateStore = async () => {
    try {
      const response = await fetch(`/api/store/validate/${storeId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Invalid store ID');
      }

      setStore(data.store);
    } catch (error) {
      setError('Invalid store ID. Please check and try again.');
      console.error('Store validation error:', error);
    } finally {
      setValidating(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(prevFiles => [...prevFiles, ...selectedFiles]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!customerName.trim()) {
      setError('Please enter your name');
      return;
    }

    setUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('storeId', storeId);
    formData.append('customerName', customerName);
    files.forEach(file => formData.append('files', file));

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload files');
      }

      // Add uploaded files to tracking list with expiration time
      setUploadedFiles(prev => [
        ...prev,
        ...data.files.map(file => ({
          ...file,
          uploadTime: new Date(),
          expirationTime: data.expirationTime,
          timeRemaining: data.expirationTime,
          orderId: data.orderId,
        })),
      ]);

      setFiles([]);
    } catch (error) {
      setError(error.message);
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  const updateTimers = () => {
    setUploadedFiles(prev => {
      const now = new Date();
      return prev
        .map(file => {
          const uploadTime = new Date(file.uploadTime);
          const diffInSeconds = file.expirationTime - Math.floor((now - uploadTime) / 1000);
          return {
            ...file,
            timeRemaining: diffInSeconds > 0 ? diffInSeconds : 0,
          };
        })
        .filter(file => file.timeRemaining > 0);
    });
  };

  const removeFile = (index) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (validating) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Validating store ID...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>{error}</div>
        <button 
          onClick={() => router.push('/customer/scan')}
          className={styles.backButton}
        >
          Back to Scan
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1>Upload Documents for Printing</h1>
      <div className={styles.storeInfo}>
        <h2>{store?.storeName}</h2>
        <p>Store ID: {storeId}</p>
      </div>

      <form onSubmit={handleUpload} className={styles.uploadForm}>
        <div className={styles.customerInfo}>
          <label htmlFor="customerName">Your Name *</label>
          <input
            type="text"
            id="customerName"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Enter your name"
            required
            className={styles.input}
          />
        </div>

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
          disabled={files.length === 0 || uploading || !customerName.trim()}
          className={styles.uploadButton}
        >
          {uploading ? 'Uploading...' : 'Upload for Printing'}
        </button>
      </form>

      {uploadedFiles.length > 0 && (
        <div className={styles.uploadedFiles}>
          <h3>Your Uploaded Files</h3>
          <p className={styles.note}>
            Files will be automatically deleted after {Math.floor(uploadedFiles[0].expirationTime / 60)} minutes
          </p>
          <div className={styles.uploadedFilesTable}>
            <table>
              <thead>
                <tr>
                  <th>File Name</th>
                  <th>Order ID</th>
                  <th>Time Remaining</th>
                </tr>
              </thead>
              <tbody>
                {uploadedFiles.map((file, index) => (
                  <tr key={index} className={styles.uploadedFileItem}>
                    <td>{file.originalName}</td>
                    <td>{file.orderId}</td>
                    <td className={`${styles.timer} ${file.timeRemaining < 60 ? styles.timerExpiring : ''}`}>
                      {formatTime(file.timeRemaining)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
} 