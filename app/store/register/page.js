'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

export default function StoreRegistration() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    storeName: '',
    ownerName: '',
    email: '',
    password: '',
    address: '',
    phone: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validateStoreData = (data) => {
    if (!data.store || typeof data.store !== 'object') {
      console.error('Invalid store data structure:', data);
      return false;
    }

    const requiredFields = ['id', 'storeId', 'storeName', 'email', 'qrCode'];
    const missingFields = requiredFields.filter(field => !data.store[field]);

    if (missingFields.length > 0) {
      console.error('Missing required store fields:', missingFields);
      return false;
    }

    if (!data.token) {
      console.error('Missing authentication token');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/store/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to register store');
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

      console.log('Registration successful, store info saved:', {
        id: data.store.id,
        storeId: data.store.storeId,
        storeName: data.store.storeName,
        email: data.store.email,
        qrCode: data.store.qrCode,
      });

      // Redirect to dashboard
      router.push('/store/dashboard');
    } catch (error) {
      console.error('Registration error:', error);
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
      <h1>Store Registration</h1>
      {error && <div className={styles.error}>{error}</div>}
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="storeName">Store Name</label>
          <input
            type="text"
            id="storeName"
            name="storeName"
            value={formData.storeName}
            onChange={handleChange}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="ownerName">Owner Name</label>
          <input
            type="text"
            id="ownerName"
            name="ownerName"
            value={formData.ownerName}
            onChange={handleChange}
            required
          />
        </div>

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

        <div className={styles.formGroup}>
          <label htmlFor="address">Store Address</label>
          <textarea
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="phone">Phone Number</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
          />
        </div>

        <button 
          type="submit" 
          className={styles.submitButton}
          disabled={loading}
        >
          {loading ? 'Registering...' : 'Register Store'}
        </button>

        <div className={styles.loginLink}>
          Already have an account? <a href="/store/login">Login here</a>
        </div>
      </form>
    </div>
  );
} 