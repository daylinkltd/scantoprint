'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { use } from 'react';
import styles from './page.module.css';

export default function PrintPage({ params }) {
  const orderId = use(params).orderId;
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [printFiles, setPrintFiles] = useState([]);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [availablePrinters, setAvailablePrinters] = useState([]);
  const [printSettings, setPrintSettings] = useState({
    printer: '',
    copies: 1,
    color: false,
    doubleSided: false,
    pageSize: 'A4',
    orientation: 'portrait',
    quality: 'normal',
    scale: 100,
    margins: 'normal',
    paperSource: 'auto',
  });

  // Detect available printers using the WebBluetooth API
  useEffect(() => {
    const detectPrinters = async () => {
      try {
        if (typeof window !== 'undefined') {
          // Try to get system printers through the browser's print dialog
          const tempFrame = document.createElement('iframe');
          tempFrame.style.display = 'none';
          document.body.appendChild(tempFrame);
          
          // Write a simple document to the iframe
          tempFrame.contentDocument.write(`
            <html>
              <body>
                <script>
                  function getPrinters() {
                    try {
                      if (window.print) {
                        // This will trigger the print dialog which shows available printers
                        window.print();
                      }
                    } catch (e) {
                      console.error('Error getting printers:', e);
                    }
                  }
                </script>
                <button onclick="getPrinters()">Get Printers</button>
              </body>
            </html>
          `);
          tempFrame.contentDocument.close();

          // Add event listener for the print dialog
          const mediaQueryList = tempFrame.contentWindow.matchMedia('print');
          mediaQueryList.addListener(function(mql) {
            if (!mql.matches) {
              // Print dialog was closed, try to get selected printer
              try {
                const printerInfo = tempFrame.contentWindow.performance.getEntriesByType('print')[0];
                if (printerInfo && printerInfo.name) {
                  setAvailablePrinters(prev => {
                    const newPrinter = { name: printerInfo.name, type: 'system' };
                    return prev.some(p => p.name === printerInfo.name) 
                      ? prev 
                      : [...prev, newPrinter];
                  });
                }
              } catch (e) {
                console.log('Could not get printer info:', e);
              }
              // Clean up the temporary iframe
              document.body.removeChild(tempFrame);
            }
          });

          // Add default options
          setAvailablePrinters([
            { name: 'Default System Printer', type: 'system' },
            { name: 'Microsoft Print to PDF', type: 'virtual' }
          ]);

          // Try to use the WebBluetooth API to detect Bluetooth printers
          if (navigator.bluetooth) {
            try {
              const device = await navigator.bluetooth.requestDevice({
                filters: [
                  { services: ['1823'] }, // Printing service UUID
                  { services: ['180F'] }  // Battery service UUID (some printers have this)
                ]
              });
              
              if (device) {
                setAvailablePrinters(prev => [
                  ...prev,
                  { name: device.name || 'Bluetooth Printer', type: 'bluetooth' }
                ]);
              }
            } catch (e) {
              console.log('Bluetooth printer detection failed:', e);
            }
          }
        }
      } catch (error) {
        console.error('Error detecting printers:', error);
        // Fallback to default printer
        setAvailablePrinters([{ name: 'Default System Printer', type: 'system' }]);
      }
    };

    detectPrinters();
  }, []);

  useEffect(() => {
    const fetchPrintFiles = async () => {
      if (typeof window === 'undefined') return;

      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/store/login');
          return;
        }

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

        // Process files and convert editable files to PDF
        const processedFiles = await Promise.all(order.files.map(async file => {
          // For editable files (docx, xlsx, etc.), convert to PDF
          if (file.type.includes('word') || 
              file.type.includes('excel') || 
              file.type.includes('spreadsheet')) {
            try {
              const convertResponse = await fetch('/api/convert-to-pdf', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                  content: file.content,
                  type: file.type,
                  name: file.name,
                }),
              });

              if (!convertResponse.ok) {
                throw new Error('Failed to convert file to PDF');
              }

              const convertedData = await convertResponse.json();
              return {
                name: file.name.replace(/\.[^.]+$/, '.pdf'),
                type: 'application/pdf',
                content: convertedData.pdfContent,
              };
            } catch (error) {
              console.error('File conversion error:', error);
              throw new Error(`Failed to convert ${file.name} to PDF`);
            }
          }

          return file;
        }));

        setPrintFiles(processedFiles);
        setLoading(false);
      } catch (error) {
        console.error('Print setup error:', error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchPrintFiles();
  }, [orderId, router]);

  const handlePrint = async () => {
    try {
      const currentFile = printFiles[currentFileIndex];

      // Create a hidden iframe for printing
      const printFrame = document.createElement('iframe');
      printFrame.style.position = 'fixed';
      printFrame.style.right = '0';
      printFrame.style.bottom = '0';
      printFrame.style.width = '0';
      printFrame.style.height = '0';
      printFrame.style.border = 'none';
      document.body.appendChild(printFrame);

      // Create print document with current settings
      const printDoc = printFrame.contentDocument;
      printDoc.open();
      printDoc.write(`
        <html>
          <head>
            <title>${currentFile.name} - Print</title>
            <style>
              @page {
                size: ${printSettings.pageSize} ${printSettings.orientation};
                margin: ${printSettings.margins === 'none' ? '0' : 
                         printSettings.margins === 'narrow' ? '0.5cm' : 
                         printSettings.margins === 'normal' ? '1cm' : '2cm'};
              }
              @media print {
                body {
                  margin: 0;
                  padding: 0;
                  ${!printSettings.color ? 'filter: grayscale(100%);' : ''}
                }
                .content {
                  width: 100%;
                  height: 100%;
                  object-fit: contain;
                  transform: scale(${printSettings.scale / 100});
                  transform-origin: top left;
                }
              }
            </style>
          </head>
          <body>
      `);

      if (currentFile.type.includes('image')) {
        const img = new Image();
        img.src = `data:${currentFile.type};base64,${currentFile.content}`;
        img.className = 'content';
        printDoc.body.appendChild(img);
      } else if (currentFile.type.includes('pdf')) {
        const pdfData = `data:application/pdf;base64,${currentFile.content}`;
        printDoc.write(`
          <embed src="${pdfData}" type="application/pdf" width="100%" height="100%" class="content">
        `);
      } else {
        const content = atob(currentFile.content);
        printDoc.write(`
          <pre style="white-space: pre-wrap; font-family: monospace; padding: 20px;">
            ${content}
          </pre>
        `);
      }

      printDoc.write('</body></html>');
      printDoc.close();

      // Wait for content to load
      printFrame.onload = () => {
        try {
          // Apply print settings
          const mediaQueryList = printFrame.contentWindow.matchMedia('print');
          mediaQueryList.addListener(function(mql) {
            if (!mql.matches) {
              document.body.removeChild(printFrame);
            }
          });

          // Set up print options
          const printOptions = {
            printer: printSettings.printer,
            copies: printSettings.copies,
            collate: true,
            color: printSettings.color ? 'color' : 'monochrome',
            duplex: printSettings.doubleSided ? 'two-sided' : 'one-sided',
            paperSize: printSettings.pageSize,
            orientation: printSettings.orientation,
            quality: printSettings.quality,
            source: printSettings.paperSource,
          };

          // Try to apply print settings if the browser supports it
          if (printFrame.contentWindow.print) {
            printFrame.contentWindow.print(printOptions);
          } else {
            printFrame.contentWindow.print();
          }
        } catch (error) {
          console.error('Print error:', error);
          document.body.removeChild(printFrame);
          setError('Failed to print. Please try again.');
        }
      };
    } catch (error) {
      console.error('Print error:', error);
      setError('Failed to prepare document for printing.');
    }
  };

  const handleBack = () => {
    if (typeof window !== 'undefined') {
      router.push('/store/dashboard');
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading print files...</div>;
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>{error}</div>
        <button onClick={handleBack} className={styles.backButton}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  const currentFile = printFiles[currentFileIndex];

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Print Document</h1>
        <button onClick={handleBack} className={styles.backButton}>
          Back to Dashboard
        </button>
      </header>

      <div className={styles.content}>
        <div className={styles.previewArea}>
          {currentFile.type.includes('image') ? (
            <img
              src={`data:${currentFile.type};base64,${currentFile.content}`}
              alt={currentFile.name}
              className={styles.previewImage}
              style={{
                filter: !printSettings.color ? 'grayscale(100%)' : 'none',
                transform: `scale(${printSettings.scale / 100})`,
              }}
            />
          ) : currentFile.type.includes('pdf') ? (
            <embed
              src={`data:application/pdf;base64,${currentFile.content}`}
              type="application/pdf"
              className={styles.previewPdf}
            />
          ) : (
            <div className={styles.previewText}>
              <pre>{atob(currentFile.content)}</pre>
            </div>
          )}
        </div>

        <div className={styles.controls}>
          <div className={styles.fileInfo}>
            <h2>{currentFile.name}</h2>
            <p>File {currentFileIndex + 1} of {printFiles.length}</p>
          </div>

          <div className={styles.printSettings}>
            <div className={styles.settingGroup}>
              <label>
                Printer:
                <select
                  value={printSettings.printer}
                  onChange={(e) => setPrintSettings(prev => ({
                    ...prev,
                    printer: e.target.value
                  }))}
                >
                  {availablePrinters.map((printer, index) => (
                    <option key={index} value={printer.name}>
                      {printer.name}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Copies:
                <input
                  type="number"
                  min="1"
                  max="99"
                  value={printSettings.copies}
                  onChange={(e) => setPrintSettings(prev => ({
                    ...prev,
                    copies: parseInt(e.target.value) || 1
                  }))}
                />
              </label>
            </div>

            <div className={styles.settingGroup}>
              <label>
                Page Size:
                <select
                  value={printSettings.pageSize}
                  onChange={(e) => setPrintSettings(prev => ({
                    ...prev,
                    pageSize: e.target.value
                  }))}
                >
                  <option value="A5">A5</option>
                  <option value="A4">A4</option>
                  <option value="A3">A3</option>
                  <option value="Letter">Letter</option>
                  <option value="Legal">Legal</option>
                  <option value="Executive">Executive</option>
                </select>
              </label>

              <label>
                Orientation:
                <select
                  value={printSettings.orientation}
                  onChange={(e) => setPrintSettings(prev => ({
                    ...prev,
                    orientation: e.target.value
                  }))}
                >
                  <option value="portrait">Portrait</option>
                  <option value="landscape">Landscape</option>
                </select>
              </label>

              <label>
                Margins:
                <select
                  value={printSettings.margins}
                  onChange={(e) => setPrintSettings(prev => ({
                    ...prev,
                    margins: e.target.value
                  }))}
                >
                  <option value="none">None</option>
                  <option value="narrow">Narrow</option>
                  <option value="normal">Normal</option>
                  <option value="wide">Wide</option>
                </select>
              </label>
            </div>

            <div className={styles.settingGroup}>
              <label>
                <input
                  type="checkbox"
                  checked={printSettings.color}
                  onChange={(e) => setPrintSettings(prev => ({
                    ...prev,
                    color: e.target.checked
                  }))}
                />
                Color Print
              </label>

              <label>
                <input
                  type="checkbox"
                  checked={printSettings.doubleSided}
                  onChange={(e) => setPrintSettings(prev => ({
                    ...prev,
                    doubleSided: e.target.checked
                  }))}
                />
                Double-sided
              </label>
            </div>

            <div className={styles.settingGroup}>
              <label>
                Quality:
                <select
                  value={printSettings.quality}
                  onChange={(e) => setPrintSettings(prev => ({
                    ...prev,
                    quality: e.target.value
                  }))}
                >
                  <option value="draft">Draft</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="photo">Photo</option>
                </select>
              </label>

              <label>
                Scale:
                <select
                  value={printSettings.scale}
                  onChange={(e) => setPrintSettings(prev => ({
                    ...prev,
                    scale: parseInt(e.target.value)
                  }))}
                >
                  <option value="50">50%</option>
                  <option value="75">75%</option>
                  <option value="100">100%</option>
                  <option value="125">125%</option>
                  <option value="150">150%</option>
                  <option value="200">200%</option>
                </select>
              </label>

              <label>
                Paper Source:
                <select
                  value={printSettings.paperSource}
                  onChange={(e) => setPrintSettings(prev => ({
                    ...prev,
                    paperSource: e.target.value
                  }))}
                >
                  <option value="auto">Auto Select</option>
                  <option value="manual">Manual Feed</option>
                  <option value="tray1">Tray 1</option>
                  <option value="tray2">Tray 2</option>
                </select>
              </label>
            </div>
          </div>

          <div className={styles.actions}>
            <button
              onClick={() => setCurrentFileIndex(prev => Math.max(0, prev - 1))}
              disabled={currentFileIndex === 0}
              className={styles.navButton}
            >
              Previous File
            </button>

            <button
              onClick={handlePrint}
              className={styles.printButton}
            >
              Print File
            </button>

            <button
              onClick={() => setCurrentFileIndex(prev => Math.min(printFiles.length - 1, prev + 1))}
              disabled={currentFileIndex === printFiles.length - 1}
              className={styles.navButton}
            >
              Next File
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 