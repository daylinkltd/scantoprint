'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

export default function EnterStoreID() {
  const router = useRouter();
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (manualStoreId.trim()) {
      await validateAndRedirect(manualStoreId.trim());
    }
  };

  return (
    <div className={styles.container}>
      <h1>Enter Store ID</h1>
      {error && <div className={styles.error}>{error}</div>}
      
      <div className={styles.formContainer}>
        <p className={styles.description}>
          Enter the store ID provided by the print store to upload your documents.
        </p>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <input
              type="text"
              value={manualStoreId}
              onChange={(e) => setManualStoreId(e.target.value)}
              placeholder="Enter Store ID"
              className={styles.input}
              autoFocus
            />
            <button 
              type="submit" 
              className={styles.submitButton}
              disabled={validating}
            >
              {validating ? 'Validating...' : 'Continue'}
            </button>
          </div>
          <p className={styles.hint}>
            The store ID can be found displayed at the store counter or on your receipt.
          </p>
        </form>
      </div>
    </div>
  );
} 