import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import type { ComparisonResult, SourcingInfo } from '../types';
import PDFReport from './PDFReport';

interface ReportGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: ComparisonResult | null;
  sourcingData: Map<string, SourcingInfo | { error: string }>;
  progress: { current: number; total: number; status: 'idle' | 'running' | 'complete' | 'error' };
  aircraftName?: string;
}

const ReportGenerationModal: React.FC<ReportGenerationModalProps> = ({ isOpen, onClose, result, sourcingData, progress, aircraftName }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => setShow(true));
    }
  }, [isOpen]);
  
  const handleClose = () => {
    setShow(false);
    setTimeout(() => onClose(), 200);
  };

  const handlePrint = () => {
    if (!result) return;
    const reportWindow = window.open('', '_blank');
    if (reportWindow) {
        reportWindow.document.write(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8" />
                <title>Tooling Report</title>
                <script src="https://cdn.tailwindcss.com"></script>
                <style>
                    @media print {
                        @page { margin: 0.5in; }
                        body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                        .no-print { display: none; }
                    }
                </style>
            </head>
            <body class="bg-white">
                <div id="report-root"></div>
            </body>
            </html>
        `);
        reportWindow.document.close();

        const reportRootEl = reportWindow.document.getElementById('report-root');
        if (reportRootEl) {
            const root = ReactDOM.createRoot(reportRootEl);
            root.render(<PDFReport result={result} sourcingData={sourcingData} isQuickReport={false} aircraftName={aircraftName} />);
            
            // Wait for render and styles to apply
            setTimeout(() => {
                reportWindow.focus();
                reportWindow.print();
            }, 1000);
        }
    }
  };

  if (!isOpen) return null;
  
  const progressPercentage = progress.total > 0 ? (progress.current / progress.total) * 100 : 0;

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4 transition-opacity duration-200 ease-out ${show ? 'opacity-100' : 'opacity-0'}`} onClick={handleClose}>
        <div className={`bg-gray-800 border border-gray-700 rounded-2xl shadow-xl w-full max-w-lg transition-all duration-200 ease-out ${show ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`} onClick={e => e.stopPropagation()}>
            <header className="p-5 border-b border-gray-700">
                <h2 className="text-xl font-bold text-white">Generate Full Sourcing Report</h2>
            </header>
            <div className="p-8 text-center">
                {progress.status === 'running' && (
                    <>
                        <p className="text-gray-300 mb-2">Fetching verified sourcing information for {progress.total} items...</p>
                        <p className="text-xs text-gray-500 mb-4">This may take several minutes due to API rate limits. Please keep this window open.</p>
                        <div className="w-full bg-gray-700 rounded-full h-4">
                            <div className="bg-cyan-500 h-4 rounded-full transition-all duration-300" style={{ width: `${progressPercentage}%` }}></div>
                        </div>
                        <p className="text-sm text-gray-400 mt-2">{progress.current} of {progress.total} items complete</p>
                    </>
                )}
                {progress.status === 'complete' && (
                    <>
                        <p className="text-green-300 text-lg mb-4">Sourcing information complete!</p>
                        <p className="text-gray-400 mb-6">Your comprehensive PDF report is ready to be viewed and printed.</p>
                        <button onClick={handlePrint} className="w-full bg-cyan-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-cyan-500 transition-colors">
                            View & Print Full Report
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