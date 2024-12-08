'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { QrReader } from 'react-qr-reader';
import styles from './page.module.css';

export default function ScanQR() {
  const router = useRouter();
  const [scanning, setScanning] = useState(false);
  const [manualStoreId, setManualStoreId] = useState('');
  const [error, setError] = useState('');
  const [validating, setValidating] = useState(false);

  const validateAndRedirect = async (storeId) => {
    setValidating(true);
    setError('');
    
    try {
      const response = await fetch(`/api/store/validate/${storeId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Invalid store ID');
      }

      router.push(`/customer/upload/${storeId}`);
    } catch (error) {
      console.error('Validation error:', error);
      setError('Invalid store ID. Please check and try again.');
    } finally {
      setValidating(false);
    }
  };

  const handleScan = (result) => {
    if (result) {
      try {
        const data = JSON.parse(result.text);
        if (data.storeId) {
          validateAndRedirect(data.storeId);
        }
      } catch (error) {
        setError('Invalid QR code');
      }
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (manualStoreId.trim()) {
      await validateAndRedirect(manualStoreId.trim());
    }
  };

  return (
    <div className={styles.container}>
      <h1>Scan Store QR Code</h1>
      {error && <div className={styles.error}>{error}</div>}
      
      <div className={styles.scanArea}>
        {!scanning ? (
          <>
            <p>Click the button below to scan the store's QR code</p>
            <button 
              onClick={() => setScanning(true)}
              className={styles.scanButton}
            >
              Start Scanning
            </button>
          </>
        ) : (
          <div className={styles.scanner}>
            <QrReader
              constraints={{ 
                facingMode: 'environment',
                width: '100%',
                height: '100%'
              }}
              onResult={handleScan}
              className={styles.qrReader}
              videoStyle={{ width: '100%', height: '100%' }}
              videoContainerStyle={{ width: '100%', height: '300px' }}
            />
            <button 
              onClick={() => setScanning(false)}
              className={styles.cancelButton}
            >
              Cancel Scanning
            </button>
          </div>
        )}
      </div>

      <div className={styles.manualEntry}>
        <h2>Or Enter Store ID Manually</h2>
        <form onSubmit={handleManualSubmit} className={styles.manualForm}>
          <input
            type="text"
            value={manualStoreId}
            onChange={(e) => setManualStoreId(e.target.value)}
            placeholder="Enter Store ID"
            className={styles.input}
          />
          <button 
            type="submit" 
            className={styles.submitButton}
            disabled={validating}
          >
            {validating ? 'Validating...' : 'Continue'}
          </button>
        </form>
      </div>
    </div>
  );
} 