
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import type { ComparisonResult, SourcingInfo } from '../types';
import PDFReport from './PDFReport';

declare global {
  interface Window {
    jspdf: any;
    html2canvas: any;
  }
}

interface ReportGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: ComparisonResult | null;
  sourcingData: Map<string, SourcingInfo | { error: string }>;
  progress: { current: number; total: number; status: 'idle' | 'running' | 'complete' | 'error' };
  aircraftName?: string;
  toolingListName?: string;
}

const ReportGenerationModal: React.FC<ReportGenerationModalProps> = ({ isOpen, onClose, result, sourcingData, progress, aircraftName, toolingListName }) => {
  const [show, setShow] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => setShow(true));
    }
  }, [isOpen]);
  
  const handleClose = () => {
    setShow(false);
    setTimeout(() => onClose(), 200);
  };

  const handleDownload = async () => {
    if (!result) return;
    setIsDownloading(true);

    const reportContainer = document.createElement('div');
    reportContainer.style.position = 'fixed';
    reportContainer.style.left = '-9999px';
    reportContainer.style.top = '0';
    // Set fixed width to match A4 @ 96DPI (approx 794px) to ensure layout consistency
    reportContainer.style.width = '794px'; 
    reportContainer.style.backgroundColor = '#ffffff';
    document.body.appendChild(reportContainer);
    
    const root = ReactDOM.createRoot(reportContainer);
    root.render(<PDFReport result={result} sourcingData={sourcingData} isQuickReport={false} aircraftName={aircraftName} toolingListName={toolingListName} />);

    // Allow time for rendering
    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
        // --- Smart Pagination Logic ---
        const A4_HEIGHT_PX = 1123; // 297mm @ 96DPI
        const atomicElements = reportContainer.querySelectorAll('.pdf-no-split');
        
        let accumulatedSpacerHeight = 0;
        let currentPage = 1;

        atomicElements.forEach((el) => {
            const element = el as HTMLElement;
            const originalTop = element.offsetTop;
            const height = element.offsetHeight;
            
            // Calculate position including any spacers we've already added
            const currentTop = originalTop + accumulatedSpacerHeight;
            const currentBottom = currentTop + height;
            
            const pageBoundary = currentPage * A4_HEIGHT_PX;

            // Check if this element crosses the page boundary
            if (currentTop < pageBoundary && currentBottom > pageBoundary) {
                // Calculate spacer needed to push this element to start of next page
                const spacerHeight = pageBoundary - currentTop;
                
                const spacer = document.createElement('div');
                spacer.style.height = `${spacerHeight}px`;
                spacer.style.width = '100%';
                spacer.style.backgroundColor = 'transparent';
                
                // Insert spacer before the element
                element.parentNode?.insertBefore(spacer, element);
                
                accumulatedSpacerHeight += spacerHeight;
                currentPage++;
            } else if (currentTop >= pageBoundary) {
                // Element is already on the next page (or further) naturally
                currentPage = Math.floor(currentTop / A4_HEIGHT_PX) + 1;
            }
        });

        // Use scale 2 for better quality, then scale down in PDF
        const canvas = await window.html2canvas(reportContainer, { 
            scale: 2,
            useCORS: true,
            scrollY: -window.scrollY // Prevent scrolling affecting capture
        });
        
        const imgData = canvas.toDataURL('image/jpeg', 0.7); // Use 0.7 quality for balance

        const pdf = new window.jspdf.jsPDF({
            orientation: 'p',
            unit: 'mm',
            format: 'a4',
            compress: true
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        
        const ratio = canvasWidth / pdfWidth;
        const imgHeightInPdfUnits = canvasHeight / ratio;

        let heightLeft = imgHeightInPdfUnits;
        let position = 0;

        // Add first page
        pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeightInPdfUnits, undefined, 'FAST');
        heightLeft -= pdfHeight;

        // Add subsequent pages
        while (heightLeft > 0) {
            position -= pdfHeight; // Move image up by one page height
            pdf.addPage();
            pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeightInPdfUnits, undefined, 'FAST');
            heightLeft -= pdfHeight;
        }

        const filename = `Tooling-Report-${aircraftName ? aircraftName.replace(/[^a-zA-Z0-9]/g, '_') : 'Inventory'}.pdf`;
        pdf.save(filename);

    } catch(e) {
        console.error("PDF download failed", e);
    } finally {
        document.body.removeChild(reportContainer);
        setIsDownloading(false);
    }
  };

  if (!isOpen) return null;
  
  const progressPercentage = progress.total > 0 ? (progress.current / progress.total) * 100 : 0;
  const estimate = progress.total;
  const timeUnit = estimate === 1 ? 'minute' : 'minutes';

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4 transition-opacity duration-200 ease-out ${show ? 'opacity-100' : 'opacity-0'}`} onClick={handleClose}>
        <div className={`bg-gray-800 border border-gray-700 rounded-2xl shadow-xl w-full max-w-lg transition-all duration-200 ease-out ${show ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`} onClick={e => e.stopPropagation()}>
            <header className="p-5 border-b border-gray-700">
                <h2 className="text-xl font-bold text-white">Generate Full Report</h2>
            </header>
            <div className="p-8 text-center">
                {progress.status === 'running' && (
                    <>
                        <p className="text-gray-300 mb-2">Fetching verified sourcing information for {progress.total} items...</p>
                        <p className="text-xs text-gray-500 mb-4">This takes about 1 minute per tool and will run for approximately {estimate} {timeUnit}. Please keep this window open.</p>
                        <div className="w-full bg-gray-700 rounded-full h-4">
                            <div className="bg-cyan-500 h-4 rounded-full transition-all duration-300" style={{ width: `${progressPercentage}%` }}></div>
                        </div>
                        <p className="text-sm text-gray-400 mt-2">{progress.current} of {progress.total} items complete</p>
                    </>
                )}
                {progress.status === 'complete' && (
                    <>
                        <p className="text-green-300 text-lg mb-4">Report Ready!</p>
                        <p className="text-gray-400 mb-6">Your comprehensive PDF report with availability, on-order status, and sourcing is ready.</p>
                        <button onClick={handleDownload} disabled={isDownloading} className="w-full bg-cyan-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-cyan-500 transition-colors disabled:bg-gray-600">
                            {isDownloading ? 'Formatting PDF...' : 'Download Full Report'}
                        </button>
                    </>
                )}
                 {progress.status === 'error' && (
                    <>
                        <p className="text-red-400 text-lg mb-4">An error occurred.</p>
                        <p className="text-gray-400 mb-6">Could not fetch all sourcing information. You can try generating the report again.</p>
                    </>
                )}
            </div>
             <footer className="flex justify-end p-4 border-t border-gray-700 bg-gray-800/50">
                <button type="button" onClick={handleClose} className="bg-gray-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-500 transition-colors">Close</button>
            </footer>
        </div>
    </div>
  );
};

export default ReportGenerationModal;
