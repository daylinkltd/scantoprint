'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

export default function StoreLogin() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validateStoreData = (data) => {
    console.log('Validating store data:', data);

    if (!data.store || typeof data.store !== 'object') {
      console.error('Invalid store data structure:', data);
      return false;
    }

    const requiredFields = ['id', 'storeId', 'storeName', 'email', 'qrCode'];
    const missingFields = requiredFields.filter(field => {
      const hasField = data.store[field] !== undefined && data.store[field] !== null;
      if (!hasField) {
        console.error(`Missing field: ${field}, value:`, data.store[field]);
      }
      return !hasField;
    });

    if (missingFields.length > 0) {
      console.error('Missing required store fields:', missingFields);
      console.error('Store data received:', data.store);
      return false;
    }

    if (!data.token) {
      console.error('Missing authentication token');
      return false;
    }

    console.log('Store data validation successful');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('Submitting login form:', formData);

      const response = await fetch('/api/store/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      console.log('Server response:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to login');
      }

      // Validate store data
      if (!validateStoreData(data)) {
        throw new Error('Invalid response from server');
      }

      // Save token and store info in localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('storeInfo', JSON.stringify({
        id: data.store.id,
        storeId: data.store.storeId,
        storeName: data.store.storeName,
        email: data.store.email,
        qrCode: data.store.qrCode,
      }));

      console.log('Login successful, store info saved:', {
        id: data.store.id,
        storeId: data.store.storeId,
        storeName: data.store.storeName,
        email: data.store.email,
        qrCode: data.store.qrCode,
      });

      // Redirect to dashboard
      router.push('/store/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className={styles.container}>
      <h1>Store Login</h1>
      {error && <div className={styles.error}>{error}</div>}
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            minLength={6}
          />
        </div>

        <button 
          type="submit" 
          className={styles.submitButton}
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>

        <div className={styles.registerLink}>
          Don't have an account? <a href="/store/register">Register here</a>
        </div>
      </form>
    </div>
  );
} 