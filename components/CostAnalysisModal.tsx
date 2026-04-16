import React, { useState, useEffect } from 'react';

interface CostAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  progress: { current: number; total: number; status: 'idle' | 'running' | 'complete' | 'error' };
}

const CostAnalysisModal: React.FC<CostAnalysisModalProps> = ({ isOpen, onClose, progress }) => {
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

  if (!isOpen) return null;
  
  const progressPercentage = progress.total > 0 ? (progress.current / progress.total) * 100 : 0;
  const estimate = progress.total;
  const timeUnit = estimate === 1 ? 'minute' : 'minutes';

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4 transition-opacity duration-200 ease-out ${show ? 'opacity-100' : 'opacity-0'}`} onClick={handleClose}>
        <div className={`bg-gray-800 border border-gray-700 rounded-2xl shadow-xl w-full max-w-lg transition-all duration-200 ease-out ${show ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`} onClick={e => e.stopPropagation()}>
            <header className="p-5 border-b border-gray-700">
                <h2 className="text-xl font-bold text-white">Market Cost Analysis</h2>
            </header>
            <div className="p-8 text-center">
                {progress.status === 'running' && (
                    <>
                        <p className="text-gray-300 mb-2">Researching average market cost for {progress.total} selected tools...</p>
                        <p className="text-xs text-gray-500 mb-4">This takes about 1 minute per tool and will run for approximately {estimate} {timeUnit}. Please keep this window open.</p>
                        <div className="w-full bg-gray-700 rounded-full h-4">
                            <div className="bg-cyan-500 h-4 rounded-full transition-all duration-300" style={{ width: `${progressPercentage}%` }}></div>
                        </div>
                        <p className="text-sm text-gray-400 mt-2">{progress.current} of {progress.total} items complete</p>
                    </>
                )}
                {progress.status === 'complete' && (
                    <>
                        <p className="text-green-300 text-lg mb-4">Cost analysis complete!</p>
                        <p className="text-gray-400">The average cost for the selected tools has been updated in the inventory manager.</p>
                    </>
                )}
                 {progress.status === 'error' && (
                    <>
                        <p className="text-red-400 text-lg mb-4">An error occurred during analysis.</p>
                        <p className="text-gray-400">Not all costs could be determined. Please check the console for details.</p>
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

export default CostAnalysisModal;