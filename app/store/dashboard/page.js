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

  const handlePrint = async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/store/orders/print/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch print files');
      }

      const data = await response.json();
      const { order } = data;

      // Create a new window for printing
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        throw new Error('Please allow popups to print documents');
      }

      // Write the content to the new window
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Print Order - ${order.customerName || 'Anonymous'}</title>
            <style>
              @page {
                size: A4;
                margin: 0;
              }
              body { 
                margin: 0;
                padding: 0;
                background: white;
              }
              .file-container {
                width: 100%;
                height: 100%;
                margin: 0;
                padding: 0;
                page-break-after: always;
                position: relative;
              }
              .file-container:last-child {
                page-break-after: avoid;
              }
              .pdf-frame {
                width: 100%;
                height: 100vh;
                border: none;
                display: block;
              }
              .image-container {
                width: 210mm;  /* A4 width */
                height: 297mm; /* A4 height */
                position: relative;
                margin: 0 auto;
                overflow: hidden;
                display: flex;
                align-items: center;
                justify-content: center;
                background: white;
              }
              .print-image {
                max-width: 100%;
                max-height: 100%;
                object-fit: contain;
                margin: auto;
              }
              @media print {
                body { 
                  margin: 0;
                  padding: 0;
                  background: white;
                  -webkit-print-color-adjust: exact;
                  print-color-adjust: exact;
                }
                .file-container {
                  width: 100%;
                  height: 100%;
                  page-break-after: always;
                }
                .file-container:last-child {
                  page-break-after: avoid;
                }
                .pdf-frame {
                  width: 100%;
                  height: 100%;
                }
                .image-container {
                  break-inside: avoid;
                  page-break-inside: avoid;
                }
                .print-image {
                  max-width: 100%;
                  max-height: 297mm; /* A4 height */
                }
              }
            </style>
            <script>
              function handleFrameLoad(frame) {
                if (frame.getAttribute('data-type').startsWith('application/pdf')) {
                  // For PDFs, maintain original format
                  frame.style.height = '100vh';
                }
              }

              function handleImageLoad(img) {
                const container = img.parentElement;
                const aspectRatio = img.naturalWidth / img.naturalHeight;
                const containerAspect = container.clientWidth / container.clientHeight;

                if (aspectRatio > containerAspect) {
                  // Image is wider than container
                  img.style.width = '100%';
                  img.style.height = 'auto';
                } else {
                  // Image is taller than container
                  img.style.height = '100%';
                  img.style.width = 'auto';
                }
              }
            </script>
          </head>
          <body>
      `);

      // Add each file to the print window
      order.files.forEach((file) => {
        const fileData = `data:${file.type};base64,${file.content}`;
        
        if (file.type.startsWith('application/pdf')) {
          // Handle PDFs
          printWindow.document.write(`
            <div class="file-container">
              <iframe 
                class="pdf-frame"
                src="${fileData}#toolbar=0&view=FitH"
                type="${file.type}"
                data-type="${file.type}"
                onload="handleFrameLoad(this)"
              ></iframe>
            </div>
          `);
        } else if (file.type.startsWith('image/')) {
          // Handle Images
          printWindow.document.write(`
            <div class="file-container">
              <div class="image-container">
                <img 
                  class="print-image"
                  src="${fileData}"
                  alt="${file.originalName}"
                  onload="handleImageLoad(this)"
                />
              </div>
            </div>
          `);
        } else {
          // Handle other file types (convert to PDF-like view)
          printWindow.document.write(`
            <div class="file-container">
              <iframe 
                class="pdf-frame"
                src="${fileData}"
                type="${file.type}"
                data-type="${file.type}"
                onload="handleFrameLoad(this)"
              ></iframe>
            </div>
          `);
        }
      });

      printWindow.document.write('</body></html>');
      printWindow.document.close();

      // Wait for content to load
      setTimeout(() => {
        try {
          printWindow.focus();
          printWindow.print();
          
          // Close window after printing
          const checkPrintDialog = setInterval(() => {
            if (printWindow.document.hasFocus()) {
              clearInterval(checkPrintDialog);
              setTimeout(() => {
                printWindow.close();
              }, 1000);
            }
          }, 500);
        } catch (error) {
          console.error('Print window error:', error);
          printWindow.close();
        }
      }, 2000);

    } catch (error) {
      console.error('Print error:', error);
      setError(error.message);
    }
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