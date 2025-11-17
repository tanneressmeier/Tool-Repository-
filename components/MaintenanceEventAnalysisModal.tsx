import React, { useState, useEffect } from 'react';
import type { MaintenanceTask } from '../types';

interface MaintenanceEventAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventName?: string;
  isLoading: boolean;
  tasks: MaintenanceTask[] | null;
}

const MaintenanceEventAnalysisModal: React.FC<MaintenanceEventAnalysisModalProps> = ({ isOpen, onClose, eventName, isLoading, tasks }) => {
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

  return (
    <div 
      className={`fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4 transition-opacity duration-200 ease-out ${show ? 'opacity-100' : 'opacity-0'}`}
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div 
        className={`bg-gray-800 border border-gray-700 rounded-2xl shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh] transition-all duration-200 ease-out ${show ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex justify-between items-center p-5 border-b border-gray-700 flex-shrink-0">
          <div>
            <h2 id="modal-title" className="text-2xl font-bold text-white">Maintenance Task Analysis</h2>
            <p className="text-cyan-300">{eventName}</p>
          </div>
          <button onClick={handleClose} className="text-gray-400 hover:text-white transition-colors" aria-label="Close modal">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        <div className="flex-grow p-5 overflow-y-auto">
          {isLoading && (
            <div className="flex flex-col items-center justify-center p-10 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
              <p className="mt-4 text-gray-300">AI is analyzing the work order and tool list...</p>
            </div>
          )}
          {!isLoading && tasks && tasks.length > 0 && (
            <ul className="space-y-4">
              {tasks.map((item, index) => (
                <li key={index} className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                  <h3 className="font-semibold text-lg text-gray-200 mb-2">{index + 1}. {item.task}</h3>
                  {item.tools.length > 0 ? (
                    <>
                      <p className="text-sm font-medium text-gray-400 mb-1">Required Tools:</p>
                      <ul className="space-y-1 pl-4">
                        {item.tools.map(tool => (
                          <li key={tool.partNumber} className="text-sm text-gray-300">
                            - {tool.name} <span className="text-gray-500">(P/N: {tool.partNumber})</span>
                          </li>
                        ))}
                      </ul>
                    </>
                  ) : (
                    <p className="text-sm text-gray-500 italic pl-4">No specific tools from the list were assigned to this task.</p>
                  )}
                </li>
              ))}
            </ul>
          )}
           {!isLoading && (!tasks || tasks.length === 0) && (
              <div className="text-center text-gray-500 p-8">
                <p className="font-semibold">Analysis Complete</p>
                <p className="text-sm mt-2">The AI could not break this event down into specific tasks and tool assignments. This may happen with very generic event names.</p>
            </div>
           )}
        </div>

        <footer className="flex justify-end items-center gap-3 p-5 border-t border-gray-700 bg-gray-800/50 rounded-b-2xl flex-shrink-0">
          <button onClick={handleClose} className="bg-gray-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-500 transition-colors">
            Close
          </button>
        </footer>
      </div>
    </div>
  );
};

export default MaintenanceEventAnalysisModal;
