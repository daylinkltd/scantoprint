'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

export default function StoreDashboard() {
  const router = useRouter();
  const [storeInfo, setStoreInfo] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const initializeDashboard = async () => {
      await checkAuthAndFetchData();
    };

    initializeDashboard();
  }, []);

  // Set up timer for updating order expiration times
  useEffect(() => {
    const interval = setInterval(updateTimers, 1000);
    return () => clearInterval(interval);
  }, []);

  // Refresh orders periodically
  useEffect(() => {
    if (storeInfo?.storeId) {
      const refreshInterval = setInterval(async () => {
        const token = localStorage.getItem('token');
        if (token) {
          await fetchOrders(token, storeInfo.storeId);
        }
      }, 30000); // Refresh every 30 seconds

      return () => clearInterval(refreshInterval);
    }
  }, [storeInfo]);

  const validateStoreInfo = (info) => {
    if (!info) {
      console.error('Store info is null or undefined');
      return false;
    }
    
    const requiredFields = ['id', 'storeId', 'storeName', 'email', 'qrCode'];
    const missingFields = requiredFields.filter(field => !info[field]);
    
    if (missingFields.length > 0) {
      console.error('Missing required fields:', missingFields);
      return false;
    }
    
    return true;
  };

  const checkAuthAndFetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const storedInfo = localStorage.getItem('storeInfo');

      if (!token || !storedInfo) {
        console.error('No token or store info found');
        router.push('/store/login');
        return;
      }

      let parsedInfo;
      try {
        parsedInfo = JSON.parse(storedInfo);
      } catch (e) {
        console.error('Failed to parse store info:', e);
        localStorage.removeItem('storeInfo');
        localStorage.removeItem('token');
        router.push('/store/login');
        return;
      }

      if (!validateStoreInfo(parsedInfo)) {
        console.error('Invalid store info structure:', parsedInfo);
        localStorage.removeItem('storeInfo');
        localStorage.removeItem('token');
        router.push('/store/login');
        return;
      }

      setStoreInfo(parsedInfo);
      console.log('Store info loaded successfully:', parsedInfo);

      await fetchOrders(token, parsedInfo.storeId);
    } catch (error) {
      console.error('Dashboard initialization error:', error);
      setError(error.message);
      router.push('/store/login');
    }
  };

  const fetchOrders = async (token, storeId) => {
    try {
      console.log('Fetching orders for store:', storeId);
      const response = await fetch(`/api/store/orders/${storeId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          console.log('Token expired or invalid');
          localStorage.removeItem('token');
          localStorage.removeItem('storeInfo');
          router.push('/store/login');
          return;
        }
        throw new Error(data.error || 'Failed to fetch orders');
      }

      console.log('Orders fetched:', data);
      setOrders(data.orders || []);
    } catch (error) {
      console.error('Fetch orders error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateTimers = () => {
    setOrders(prevOrders => {
      const now = new Date();
      return prevOrders
        .map(order => ({
          ...order,
          timeRemaining: Math.max(
            0,
            order.timeRemaining - 1
          ),
        }))
        .filter(order => order.timeRemaining > 0);
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('storeInfo');
    router.push('/store/login');
  };

  const handlePrint = (orderId) => {
    router.push(`/store/print/${orderId}`);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.storeInfo}>
          <h1>{storeInfo?.storeName}</h1>
          <p>Store ID: {storeInfo?.storeId}</p>
        </div>
        <button onClick={handleLogout} className={styles.logoutButton}>
          Logout
        </button>
      </header>

      <div className={styles.qrSection}>
        <h2>Store QR Code</h2>
        <div className={styles.qrCode}>
          <img src={storeInfo?.qrCode} alt="Store QR Code" />
        </div>
        <p>Scan this QR code to upload files for printing</p>
      </div>

      <section className={styles.ordersSection}>
        <h2>Orders</h2>
        {error && <div className={styles.error}>{error}</div>}
        {orders.length === 0 ? (
          <p className={styles.noOrders}>No orders available</p>
        ) : (
          <div className={styles.ordersTable}>
            <table>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Files</th>
                  <th>Time Remaining</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id} className={styles.orderRow}>
                    <td>{order._id}</td>
                    <td>{order.customerName || 'Anonymous'}</td>
                    <td>
                      <ul className={styles.filesList}>
                        {order.files.map((file, index) => (
                          <li key={index}>{file.originalName}</li>
                        ))}
                      </ul>
                    </td>
                    <td className={`${styles.timer} ${order.timeRemaining < 60 ? styles.timerExpiring : ''}`}>
                      {formatTime(order.timeRemaining)}
                    </td>
                    <td>
                      <button
                        onClick={() => handlePrint(order._id)}
                        className={styles.printButton}
                      >
                        Print
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
} 